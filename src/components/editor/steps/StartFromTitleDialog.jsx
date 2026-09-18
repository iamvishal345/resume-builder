import { useState } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Sparkles, Wand2 } from "lucide-react";
import {
  aiGenerate,
  isAiAvailable,
  textToParagraphs,
} from "@features/ai/provider";
import { useStore } from "@store";
import AiSettingsDialog from "../../ai/AiSettingsDialog";

const parseJson = (raw) => {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const body =
    firstBrace >= 0 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;
  return JSON.parse(body);
};

const itemsHtml = (lines) => {
  const bullets = (lines || [])
    .map((line) => String(line).trim())
    .filter(Boolean)
    .map((line) => `<li>${line.replace(/^[-*•]\s*/, "")}</li>`)
    .join("");
  return bullets ? `<ul>${bullets}</ul>` : "";
};

const StartFromTitleDialog = ({ isOpen, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const hasAi = isAiAvailable();

  const setPersonalDetails = useStore((state) => state.setPersonalDetails);
  const setResumeSummary = useStore((state) => state.setResumeSummary);
  const setWorkHistory = useStore((state) => state.setWorkHistory);
  const setSkills = useStore((state) => state.setSkills);
  const workHistory = useStore((state) => state.workHistory);
  const skills = useStore((state) => state.skills);

  const reset = () => {
    setTitle("");
    setContext("");
    setError("");
    setBusy(false);
    onOpenChange(false);
  };

  const generate = async () => {
    if (!title.trim()) {
      setError("Enter a job title to start from.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const system =
        'You are a resume first-draft assistant. Write a believable first draft for the job title the user gives. Invent plausible achievements and tools, but do not name real companies, universities, or people. Keep every sentence specific enough to be useful. Return STRICT JSON only, no markdown, in exactly this shape: {"designation": string, "summary": string, "highlights": string[], "skills": string[]}. designation = the job title as a role label. summary = 2-3 plain-text sentences (no bullets). highlights = 3-5 professional achievement bullet points (plain text, no bullet characters). skills = 8-12 concise skill names.';
      const user = `JOB TITLE: ${title.trim()}\n${context.trim() ? `EXTRA CONTEXT/EMPHASIS:\n${context.trim()}` : ""}`;
      const raw = await aiGenerate({ system, user });
      const parsed = parseJson(raw);

      if (parsed.designation) {
        setPersonalDetails(
          "designation",
          String(parsed.designation).slice(0, 80),
        );
      }
      if (parsed.summary) {
        setResumeSummary(textToParagraphs(String(parsed.summary)));
      }
      if (Array.isArray(parsed.highlights) && parsed.highlights.length) {
        const entry = {
          key: crypto.randomUUID(),
          positionTitle: String(parsed.designation || title).slice(0, 80),
          companyName: "",
          location: "",
          startDate: "",
          endDate: "",
          workSummary: itemsHtml(parsed.highlights),
        };
        setWorkHistory([entry, ...(workHistory || [])]);
      }
      if (Array.isArray(parsed.skills) && parsed.skills.length) {
        if (!skills.length) {
          setSkills(
            parsed.skills
              .slice(0, 12)
              .map((name) => ({
                key: crypto.randomUUID(),
                name: String(name).slice(0, 40),
                level: 1,
              })),
          );
        } else {
          setSkills(
            skills
              .concat(
                parsed.skills.slice(0, 6).map((name) => ({
                  key: crypto.randomUUID(),
                  name: String(name).slice(0, 40),
                  level: 1,
                })),
              )
              .slice(0, 18),
          );
        }
      }
      reset();
    } catch (e) {
      setError(
        e && e.message && !/Failed to fetch/i.test(e.message)
          ? e.message
          : "AI drafting failed. Check your provider and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onOpenChange={(open) => !busy && onOpenChange(open)}
        width={560}
        maxHeight="80dvh"
        padding={2}
      >
        <DialogHeader
          title="Start from a job title"
          subtitle="The AI drafts a summary, achievements, and skills into this resume. Review and edit every field afterwards."
          onOpenChange={onOpenChange}
        />
        <div className="r-gallery-scroll">
          {hasAi ? (
            <VStack gap={3} width="100%" padding={2}>
              <TextInput
                label="Job title"
                value={title}
                onChange={setTitle}
                placeholder="e.g. Senior Frontend Engineer"
                width="100%"
                isDisabled={busy}
              />
              <TextArea
                label="What to emphasize? (optional)"
                value={context}
                onChange={setContext}
                rows={3}
                placeholder="e.g. led design systems, 0→1 products, mentoring"
                width="100%"
                isDisabled={busy}
              />
              {error && (
                <Text type="inherit" size="sm" color="accent">
                  {error}
                </Text>
              )}
              <HStack justify="end" width="100%" gap={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  label="Cancel"
                  onClick={() => onOpenChange(false)}
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Wand2 size={14} />}
                  label={busy ? "Drafting…" : "Generate draft"}
                  disabled={busy || !title.trim()}
                  onClick={generate}
                />
              </HStack>
            </VStack>
          ) : (
            <VStack gap={3} width="100%" padding={4}>
              <EmptyState
                icon={<Sparkles size={24} />}
                title="No AI provider configured"
                description="Add an API key in AI settings, or use a browser with built-in AI (Chrome Nano)."
                actions={
                  <HStack justify="center" gap={2}>
                    <Button
                      variant="ghost"
                      size="sm"
                      label="Close"
                      onClick={() => onOpenChange(false)}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      label="Configure AI"
                      onClick={() => setAiSettingsOpen(true)}
                    />
                  </HStack>
                }
              />
            </VStack>
          )}
        </div>
      </Dialog>
      <AiSettingsDialog
        isOpen={aiSettingsOpen}
        onOpenChange={setAiSettingsOpen}
      />
    </>
  );
};

export default StartFromTitleDialog;
