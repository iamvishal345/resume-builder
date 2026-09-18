import { useState } from "react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { TextArea } from "@astryxdesign/core/TextArea";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Sparkles, Check, X } from "lucide-react";
import { resumeViewModel } from "@features/resume/viewModel";
import { resumeTextOf } from "@features/jdmatch/analyze";
import {
  aiGenerate,
  isAiAvailable,
  textToParagraphs,
} from "@features/ai/provider";
import { getResume, putResume, newResume } from "@features/resumes/db";
import { saveVersion } from "@features/resumes/versions";
import { extractBullets } from "@features/ats/metrics";
import AiSettingsDialog from "../ai/AiSettingsDialog";
import { nameOf } from "./resumeMeta";

const TailorDialog = ({ doc, onOpenChange }) => {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [proposal, setProposal] = useState(null);
  const hasAi = isAiAvailable();

  const propose = async () => {
    if (!jd.trim()) return;
    setBusy(true);
    setError("");
    setProposal(null);
    try {
      const current = await getResume(doc.id);
      if (!current) throw new Error("Resume no longer exists.");
      const resumeText = resumeTextOf(resumeViewModel(current.data));
      const system = `You are a professional resume-tailoring assistant. Rewrite content to match the job description. Keep every claim grounded in the original — do not invent credentials. Return STRICT JSON only:
{"summary": string, "roles": [{"index": number, "bullets": string[]}], "skillsToAdd": string[]}
- summary: 2-3 sentences
- roles: up to 4 experience entries by 0-based index; bullets: 3-6 plain achievement lines each
- skillsToAdd: keywords from the JD missing from the resume (max 8)`;
      const user = `JOB DESCRIPTION:\n${jd}\n\nCURRENT RESUME:\n${resumeText.slice(0, 14000)}`;
      const raw = await aiGenerate({ system, user });
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      const parsed = JSON.parse(
        firstBrace >= 0 && lastBrace > firstBrace
          ? cleaned.slice(firstBrace, lastBrace + 1)
          : cleaned,
      );
      const roles = Array.isArray(parsed.roles)
        ? parsed.roles.map((r) => ({
            index: Number(r.index) || 0,
            bullets: (r.bullets || []).map(String),
            accept: true,
            acceptBullets: (r.bullets || []).map(() => true),
          }))
        : [];
      setProposal({
        summary: {
          text: String(parsed.summary || ""),
          accept: Boolean(parsed.summary),
        },
        roles,
        skills: {
          add: Array.isArray(parsed.skillsToAdd)
            ? parsed.skillsToAdd.map(String).filter(Boolean)
            : [],
          accept: true,
        },
        source: current,
      });
    } catch (e) {
      setError(e?.message || "AI tailoring failed.");
    } finally {
      setBusy(false);
    }
  };

  const applyAccepted = async () => {
    if (!proposal?.source) return;
    setBusy(true);
    setError("");
    try {
      const current = proposal.source;
      await saveVersion(
        current.id,
        current.data,
        `Before tailor · ${new Date().toLocaleString()}`,
      );
      const copy = newResume(`${nameOf(current)} (tailored)`, current.data);
      if (proposal.summary.accept && proposal.summary.text) {
        copy.data.resumeSummary = textToParagraphs(proposal.summary.text);
      }
      const history = [...(copy.data.workHistory || [])];
      for (const role of proposal.roles) {
        if (!role.accept) continue;
        const entry = history[role.index];
        if (!entry) continue;
        const accepted = role.bullets.filter((_, i) => role.acceptBullets[i]);
        if (!accepted.length) continue;
        const bullets = accepted.map((line) => `<li>${line.trim()}</li>`).join("");
        const existing = extractBullets(entry.workSummary);
        const keep = existing.length
          ? `<ul>${existing.map((b) => `<li>${b}</li>`).join("")}</ul>`
          : "";
        entry.workSummary = `<ul>${bullets}</ul>${keep}`;
      }
      copy.data.workHistory = history;
      if (proposal.skills.accept && proposal.skills.add.length) {
        const existing = new Set(
          (copy.data.skills || []).map((s) =>
            (s.name || s).toString().toLowerCase(),
          ),
        );
        const next = [...(copy.data.skills || [])];
        for (const name of proposal.skills.add) {
          if (!existing.has(name.toLowerCase())) {
            next.push({
              key: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name,
              level: 3,
            });
            existing.add(name.toLowerCase());
          }
        }
        copy.data.skills = next;
      }
      await putResume(copy);
      onOpenChange(null);
      window.location.href = `/editor?resume=${copy.id}`;
    } catch (e) {
      setError(e?.message || "Could not apply changes.");
    } finally {
      setBusy(false);
    }
  };

  const toggleBullet = (roleIndex, bulletIndex) => {
    setProposal((p) => {
      if (!p) return p;
      const roles = p.roles.map((r, i) => {
        if (i !== roleIndex) return r;
        const acceptBullets = [...r.acceptBullets];
        acceptBullets[bulletIndex] = !acceptBullets[bulletIndex];
        return { ...r, acceptBullets };
      });
      return { ...p, roles };
    });
  };

  return (
    <>
      <Dialog
        isOpen={!!doc}
        onOpenChange={() => !busy && onOpenChange(null)}
        width={640}
        maxHeight="85dvh"
        padding={2}
      >
        {doc && (
          <>
            <DialogHeader
              title="Tailor a copy for a job"
              subtitle={`Duplicates "${nameOf(doc)}". Review and accept changes per section.`}
              onOpenChange={() => !busy && onOpenChange(null)}
            />
            {hasAi ? (
              <div className="r-gallery-scroll">
                <VStack gap={3} width="100%" padding={2}>
                  {!proposal ? (
                    <>
                      <Text type="inherit" size="sm" color="secondary">
                        Paste the job description. A snapshot of the original is
                        saved locally before creating the tailored copy.
                      </Text>
                      <TextArea
                        label="Job description"
                        value={jd}
                        onChange={setJd}
                        rows={8}
                        width="100%"
                      />
                    </>
                  ) : (
                    <VStack gap={3} width="100%">
                      <CheckboxInput
                        label="Accept summary"
                        value={proposal.summary.accept}
                        onChange={(v) =>
                          setProposal((p) => ({
                            ...p,
                            summary: { ...p.summary, accept: v },
                          }))
                        }
                      />
                      <Text type="inherit" size="sm" color="secondary">
                        {proposal.summary.text || "(empty)"}
                      </Text>

                      {proposal.roles.map((role, ri) => {
                        const entry =
                          proposal.source.data.workHistory?.[role.index];
                        return (
                          <VStack key={ri} gap={1} width="100%">
                            <CheckboxInput
                              label={
                                entry?.positionTitle ||
                                `Role ${role.index + 1}`
                              }
                              value={role.accept}
                              onChange={(v) =>
                                setProposal((p) => {
                                  const roles = p.roles.map((r, i) =>
                                    i === ri ? { ...r, accept: v } : r,
                                  );
                                  return { ...p, roles };
                                })
                              }
                            />
                            {role.bullets.map((b, bi) => (
                              <CheckboxInput
                                key={bi}
                                label={b}
                                value={role.acceptBullets[bi]}
                                isDisabled={!role.accept}
                                onChange={() => toggleBullet(ri, bi)}
                              />
                            ))}
                          </VStack>
                        );
                      })}

                      {proposal.skills.add.length > 0 && (
                        <CheckboxInput
                          label={`Add skills: ${proposal.skills.add.join(", ")}`}
                          value={proposal.skills.accept}
                          onChange={(v) =>
                            setProposal((p) => ({
                              ...p,
                              skills: { ...p.skills, accept: v },
                            }))
                          }
                        />
                      )}
                    </VStack>
                  )}

                  {error && (
                    <Text type="inherit" size="sm" color="accent" role="alert">
                      {error}
                    </Text>
                  )}
                  <HStack justify="end" width="100%" gap={2}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<X size={14} />}
                      label={proposal ? "Back" : "Cancel"}
                      onClick={() =>
                        proposal ? setProposal(null) : onOpenChange(null)
                      }
                    />
                    {!proposal ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Sparkles size={14} />}
                        label={busy ? "Working…" : "Propose changes"}
                        disabled={busy || !jd.trim()}
                        onClick={propose}
                      />
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Check size={14} />}
                        label={busy ? "Applying…" : "Apply accepted → new copy"}
                        disabled={busy}
                        onClick={applyAccepted}
                      />
                    )}
                  </HStack>
                </VStack>
              </div>
            ) : (
              <div className="r-gallery-scroll">
                <VStack gap={3} width="100%" padding={4}>
                  <EmptyState
                    icon={<Sparkles size={24} />}
                    title="No AI provider configured"
                    description="Add an API key in AI settings, or use Chrome built-in AI."
                    actions={
                      <Button
                        variant="primary"
                        size="sm"
                        label="Configure AI"
                        onClick={() => setAiSettingsOpen(true)}
                      />
                    }
                  />
                </VStack>
              </div>
            )}
          </>
        )}
      </Dialog>
      <AiSettingsDialog
        isOpen={aiSettingsOpen}
        onOpenChange={setAiSettingsOpen}
      />
    </>
  );
};

export default TailorDialog;
