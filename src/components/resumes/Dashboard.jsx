import React, { useEffect, useRef, useState } from "react";
import {
  Layout,
  LayoutContent,
  VStack,
  HStack,
} from "@astryxdesign/core/Layout";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { Divider } from "@astryxdesign/core/Divider";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { List, ListItem } from "@astryxdesign/core/List";
import { TextArea } from "@astryxdesign/core/TextArea";
import {
  Plus,
  Eye,
  Pencil,
  Copy,
  Trash2,
  LayoutTemplate,
  Palette,
  Mail,
  Sparkles,
  FileDown,
  FileText,
  AlertTriangle,
  Download,
  Upload,
} from "lucide-react";
import { defaultResumeData } from "@store";
import { Resume } from "@features/resume/Resume";
import { resolveTemplate } from "@features/resume/templates";
import { resumeTextOf } from "@features/jdmatch/analyze";
import {
  aiGenerate,
  isAiAvailable,
  textToParagraphs,
} from "@features/ai/provider";
import {
  listResumes,
  getResume,
  putResume,
  deleteResume,
  newResume,
  migrateLegacyLocalStorage,
} from "@features/resumes/db";
import {
  exportResumeJson,
  readResumeBackupFile,
  restoreFromText,
} from "@features/resumes/backup";
import {
  downloadResumePdf,
  downloadCoverLetterPdf,
} from "@features/export/pdf";
import CoverLetterSheet from "../preview/CoverLetterSheet";
import TemplateGallery from "../preview/TemplateGallery";
import TemplateCustomize from "../preview/TemplateCustomize";
import AiSettingsDialog from "../ai/AiSettingsDialog";
import "./dashboard.css";

const nameOf = (doc) => {
  const pd = doc?.data?.personalDetails || {};
  const computed = [pd.firstName, pd.lastName].filter(Boolean).join(" ");
  const name = doc?.name;
  if (name && name !== "Untitled resume") return name;
  return computed || name || "Untitled resume";
};

const resumeDocOf = (data) => ({
  pd: data.personalDetails,
  socialLinks: data.socialLinks,
  summary: data.resumeSummary,
  experience: data.workHistory,
  education: data.education,
  skills: data.skills,
  extras: data.additionalSections,
});

const relativeTime = (ts) => {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const PreviewDialog = ({ doc, autoPrint, onOpenChange }) => {
  const sheetRef = useRef(null);
  useEffect(() => {
    if (autoPrint && doc) {
      const id = window.setTimeout(() => {
        const current = { ...defaultResumeData(), ...(doc.data || {}) };
        downloadResumePdf({
          data: resumeDocOf(current),
          templateId: current.resumeSettings.templateId,
          paletteId: current.resumeSettings.paletteId,
          fontId: current.resumeSettings.fontId,
          settings: current.resumeSettings,
        })
          .then(() => onOpenChange(null))
          .catch(() => {});
      }, 250);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [autoPrint, doc?.id, onOpenChange]);

  const raw = { ...defaultResumeData(), ...(doc?.data || {}) };
  const data = resumeDocOf(raw);
  const download = () =>
    downloadResumePdf({
      data,
      templateId: raw.resumeSettings.templateId,
      paletteId: raw.resumeSettings.paletteId,
      fontId: raw.resumeSettings.fontId,
      settings: raw.resumeSettings,
    });

  return (
    <Dialog
      isOpen={!!doc}
      onOpenChange={() => onOpenChange(null)}
      width={840}
      padding={2}
    >
      {doc && (
        <>
          <DialogHeader
            title={`${nameOf(doc)} — preview`}
            subtitle="What your resume looks like. Download a PDF or open the editor to tweak it."
            onOpenChange={() => onOpenChange(null)}
            padding={2}
          />
          <div className="r-gallery-scroll">
            <VStack gap={3} width="100%" padding={4} align="center">
              <div className="preview-sheet-wrap">
                <div className="preview-sheet-container" ref={sheetRef}>
                  <Resume
                    data={data}
                    templateId={raw.resumeSettings.templateId}
                    paletteId={raw.resumeSettings.paletteId}
                    fontId={raw.resumeSettings.fontId}
                    settings={raw.resumeSettings}
                  />
                </div>
              </div>
              <HStack gap={2} align="center" wrap>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download size={14} />}
                  label="Download PDF"
                  onClick={() => download()}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Pencil size={14} />}
                  label="Edit in builder"
                  onClick={() => {
                    window.location.href = `/editor?resume=${doc.id}`;
                  }}
                />
              </HStack>
            </VStack>
          </div>
        </>
      )}
    </Dialog>
  );
};

const CoverLetterDialog = ({ doc, onOpenChange }) => {
  const sheetRef = useRef(null);
  const data = { ...defaultResumeData(), ...(doc?.data || {}) };
  const hasContent = Boolean(
    doc && (data.coverLetter.recipient || data.coverLetter.body),
  );
  const download = () =>
    downloadCoverLetterPdf({
      personalDetails: data.personalDetails,
      socialLinks: data.socialLinks,
      coverLetter: data.coverLetter,
      fontId: data.resumeSettings?.fontId,
    });

  return (
    <Dialog
      isOpen={!!doc}
      onOpenChange={() => onOpenChange(null)}
      width={840}
      maxHeight="88dvh"
      padding={2}
    >
      {doc && (
        <>
          <DialogHeader
            title={`${nameOf(doc)} — cover letter`}
            subtitle="Preview or download the cover letter saved with this resume."
            onOpenChange={() => onOpenChange(null)}
            padding={2}
          />
          <div className="r-gallery-scroll">
            <VStack gap={3} width="100%" padding={4} align="center">
              {hasContent ? (
                <div className="letter-preview-scroll letter-preview-scroll-dialog">
                  <Card padding={5} width="100%" className="letter-paper-wrap">
                    <CoverLetterSheet
                      personalDetails={data.personalDetails}
                      socialLinks={data.socialLinks}
                      coverLetter={data.coverLetter}
                      letterRef={sheetRef}
                    />
                  </Card>
                </div>
              ) : (
                <EmptyState
                  icon={<Mail size={24} />}
                  title="No cover letter yet"
                  description="Open this resume in the builder, switch to the Letter view, and write one to preview it here."
                  actions={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Pencil size={14} />}
                      label="Open in builder"
                      onClick={() => {
                        window.location.href = `/editor?resume=${doc.id}&view=letter`;
                      }}
                    />
                  }
                />
              )}
              {hasContent && (
                <HStack gap={2} align="center" wrap>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Download size={14} />}
                    label="Download PDF"
                    onClick={() => download()}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Pencil size={14} />}
                    label="Edit letter"
                    onClick={() => {
                      window.location.href = `/editor?resume=${doc.id}&view=letter`;
                    }}
                  />
                </HStack>
              )}
            </VStack>
          </div>
        </>
      )}
    </Dialog>
  );
};

const TailorDialog = ({ doc, onOpenChange }) => {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const hasAi = isAiAvailable();

  const run = async () => {
    if (!jd.trim()) return;
    setBusy(true);
    setError("");
    try {
      const current = await getResume(doc.id);
      if (!current) throw new Error("Resume no longer exists.");
      const copy = newResume(`${nameOf(current)} (tailored)`, current.data);
      copy.data.resumeSummary = current.data.resumeSummary || "";
      const resumeText = resumeTextOf({
        pd: current.data.personalDetails,
        socialLinks: current.data.socialLinks,
        summary: current.data.resumeSummary,
        experience: current.data.workHistory,
        education: current.data.education,
        skills: current.data.skills,
        extras: current.data.additionalSections,
      });
      const system =
        'You are a professional resume-tailoring assistant. Rewrite the candidate\'s resume content to emphasize the achievements, keywords and experience most relevant to the job description. Keep every claim grounded in the original resume — do not invent credentials. Return STRICT JSON only, no markdown, in exactly this shape: {"summary": string, "highlights": string[]}. summary = 2-3 plain-text sentences. highlights = 3-5 achievement bullet points (plain text, no bullets/dashes).';
      const user = `JOB DESCRIPTION:\n${jd}\n\nCURRENT RESUME:\n${resumeText.slice(0, 12000)}`;
      const raw = await aiGenerate({ system, user });
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      const parsed = JSON.parse(
        firstBrace >= 0 && lastBrace > firstBrace
          ? cleaned.slice(firstBrace, lastBrace + 1)
          : cleaned,
      );
      if (parsed.summary) {
        copy.data.resumeSummary = textToParagraphs(String(parsed.summary));
      }
      if (Array.isArray(parsed.highlights) && parsed.highlights.length) {
        const bullets = parsed.highlights
          .map((line) => `<li>${String(line).trim()}</li>`)
          .join("");
        const entry = copy.data.workHistory && copy.data.workHistory[0];
        if (entry) {
          const heading =
            entry.workSummary && !/^<ul>/.test(entry.workSummary)
              ? entry.workSummary
              : "";
          const existing = /^<ul>/.test(entry.workSummary)
            ? entry.workSummary
            : "";
          entry.workSummary = `<ul>${bullets}</ul>${existing || heading}`;
        } else {
          copy.data.workHistory = [
            {
              key: "highlights",
              positionTitle: "Highlights tailored to this role",
              companyName: "",
              location: "",
              startDate: "",
              endDate: "",
              workSummary: `<ul>${bullets}</ul>`,
            },
          ];
        }
      }
      await putResume(copy);
      onOpenChange(null);
      window.location.href = `/editor?resume=${copy.id}`;
    } catch (e) {
      setError(e && e.message ? e.message : "AI tailoring failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog
        isOpen={!!doc}
        onOpenChange={() => !busy && onOpenChange(null)}
        width={560}
        maxHeight="80dvh"
        padding={2}
      >
        {doc && (
          <>
            <DialogHeader
              title="Tailor a copy for a job"
              subtitle={`Duplicates "${nameOf(doc)}" and rewrites the summary and top experience bullets to match a job description.`}
              onOpenChange={() => !busy && onOpenChange(null)}
            />
            {hasAi ? (
              <div className="r-gallery-scroll">
                <VStack gap={3} width="100%" padding={2}>
                  <Text type="inherit" size="sm" color="secondary">
                    Paste the job description. The AI creates a new resume,
                    keeps your original untouched, and opens the tailored copy
                    in the editor.
                  </Text>
                  <TextArea
                    label="Job description"
                    value={jd}
                    onChange={setJd}
                    rows={9}
                    placeholder="Data Analyst (3 days on-site) — analyse datasets with SQL and Python, build dashboards in Tableau…"
                    width="100%"
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
                      onClick={() => onOpenChange(null)}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Sparkles size={14} />}
                      label={busy ? "Working…" : "Create tailored copy"}
                      disabled={busy || !jd.trim()}
                      onClick={run}
                    />
                  </HStack>
                </VStack>
              </div>
            ) : (
              <div className="r-gallery-scroll">
                <VStack gap={3} width="100%" padding={4}>
                  <EmptyState
                    icon={<Sparkles size={24} />}
                    title="No AI provider configured"
                    description="Add an API key in AI settings, or use a browser with built-in AI (Chrome Nano)."
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

const ResumesDashboard = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [autoPrintPreview, setAutoPrintPreview] = useState(false);
  const [coverDoc, setCoverDoc] = useState(null);
  const [galleryDoc, setGalleryDoc] = useState(null);
  const [customizeDoc, setCustomizeDoc] = useState(null);
  const [tailorDoc, setTailorDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [message, setMessage] = useState(null);
  const restoreInputRef = useRef(null);

  const load = async () => {
    try {
      let docs = await listResumes();
      if (docs.length === 0) {
        await migrateLegacyLocalStorage();
        docs = await listResumes();
      }
      setList(docs);
      setError("");
    } catch (e) {
      setError(e && e.message ? e.message : "Could not load your resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onFocus = () => {
      listResumes()
        .then(setList)
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const createNew = async () => {
    const doc = newResume("Untitled resume");
    await putResume(doc);
    window.location.href = `/editor?resume=${doc.id}`;
  };

  const duplicate = async (doc) => {
    const copy = newResume(`${nameOf(doc)} (copy)`, doc.data);
    await putResume(copy);
    await load();
  };

  const remove = async (doc) => {
    await deleteResume(doc.id);
    setDeleteDoc(null);
    await load();
  };

  const restoreBackupFile = async (file) => {
    if (!file) return;
    try {
      const text = await readResumeBackupFile(file);
      const result = await restoreFromText(text, { newResume, putResume });
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error });
        return;
      }
      await load();
      setMessage({
        kind: "ok",
        text: `Restored "${result.doc.name}" from backup.`,
      });
    } catch (e) {
      setMessage({
        kind: "error",
        text: e && e.message ? e.message : "Could not restore that file.",
      });
    } finally {
      if (restoreInputRef.current) restoreInputRef.current.value = "";
    }
  };

  const onDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    for (const file of files) {
      await restoreBackupFile(file);
    }
  };

  useEffect(() => {
    const onDragOver = (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const updateSettings = async (doc, patch) => {
    const current = await getResume(doc.id);
    if (!current) return;
    current.data.resumeSettings = {
      ...(current.data.resumeSettings || {}),
      ...patch,
    };
    current.updatedAt = Date.now();
    current.name = nameOf(current);
    await putResume(current);
    await load();
  };

  const rowMeta = (doc) => {
    const template = resolveTemplate(doc.data.resumeSettings?.templateId);
    const tmplName = template ? template.name : "Default";
    return `${tmplName} · Updated ${relativeTime(doc.updatedAt)}`;
  };

  return (
    <Layout height="auto" padding={3} contentWidth={1080}>
      <LayoutContent role="main">
        <VStack gap={4} width="100%">
          <HStack justify="between" align="center" width="100%" wrap>
            <VStack gap={0}>
              <Text type="inherit" size="xl" weight="semibold" color="primary">
                Your resumes
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                All documents live in this browser (IndexedDB). Nothing is
                uploaded. Drop a backup file (.r.json) anywhere to restore it.
              </Text>
            </VStack>
            <HStack gap={2} align="center" wrap>
              <Button
                variant="secondary"
                icon={<Upload size={15} />}
                label="Restore backup"
                onClick={() => restoreInputRef.current?.click()}
              />
              <Button
                variant="primary"
                icon={<Plus size={15} />}
                label="New resume"
                onClick={createNew}
              />
            </HStack>
          </HStack>

          <input
            ref={restoreInputRef}
            type="file"
            accept=".json,.r.json,application/json"
            multiple
            style={{ display: "none" }}
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              for (const file of files) restoreBackupFile(file);
            }}
          />

          {message && (
            <Card
              variant={message.kind === "ok" ? "green" : "red"}
              padding={3}
              width="100%"
            >
              <HStack gap={2} align="center">
                {message.kind === "ok" ? (
                  <Upload size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
                <Text type="inherit" size="sm">
                  {message.text}
                </Text>
              </HStack>
            </Card>
          )}

          {error && (
            <Card variant="muted" padding={3} width="100%">
              <HStack gap={2} align="center">
                <AlertTriangle size={15} />
                <Text type="inherit" size="sm">
                  {error}
                </Text>
              </HStack>
            </Card>
          )}

          {loading ? (
            <Card padding={4} width="100%">
              <Text type="inherit" size="sm" color="secondary">
                Loading resumes…
              </Text>
            </Card>
          ) : list.length === 0 ? (
            <EmptyState
              icon={<FileText size={26} />}
              title="No resumes yet"
              description="Create your first resume — it saves automatically to this browser as you type."
              actions={
                <Button
                  variant="primary"
                  icon={<Plus size={15} />}
                  label="Create resume"
                  onClick={createNew}
                />
              }
            />
          ) : (
            <Card padding={2} width="100%">
              <List hasDividers density="spacious">
                {list.map((doc) => (
                  <ListItem
                    key={doc.id}
                    label={nameOf(doc)}
                    description={rowMeta(doc)}
                    startContent={
                      <span className="rdash-file">
                        <FileText size={18} />
                      </span>
                    }
                    endContent={
                      <HStack gap={1} align="center" wrap>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Preview resume"
                          tooltip="Preview resume"
                          icon={<Eye size={16} />}
                          onClick={() => setPreviewDoc(doc)}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Edit resume"
                          tooltip="Edit resume"
                          icon={<Pencil size={16} />}
                          onClick={() => {
                            window.location.href = `/editor?resume=${doc.id}`;
                          }}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Download PDF"
                          tooltip="Download PDF"
                          icon={<FileDown size={16} />}
                          onClick={() => {
                            setAutoPrintPreview(true);
                            setPreviewDoc(doc);
                          }}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Backup JSON"
                          tooltip="Download this resume as a JSON backup"
                          icon={<Download size={16} />}
                          onClick={() => exportResumeJson(doc)}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Cover letter"
                          tooltip="Cover letter"
                          icon={<Mail size={16} />}
                          onClick={() => setCoverDoc(doc)}
                        />
                        <Divider
                          orientation="vertical"
                          style={{ height: "var(--spacing-4)" }}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Change template"
                          tooltip="Change template"
                          icon={<LayoutTemplate size={16} />}
                          onClick={() => setGalleryDoc(doc)}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Change theme"
                          tooltip="Change theme"
                          icon={<Palette size={16} />}
                          onClick={() => setCustomizeDoc(doc)}
                        />
                        <Divider
                          orientation="vertical"
                          style={{ height: "var(--spacing-4)" }}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Duplicate"
                          tooltip="Duplicate"
                          icon={<Copy size={16} />}
                          onClick={() => duplicate(doc)}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Tailor for a job (AI)"
                          tooltip="Tailor for a job (AI)"
                          icon={<Sparkles size={16} />}
                          onClick={() => setTailorDoc(doc)}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Delete"
                          tooltip="Delete"
                          icon={<Trash2 size={16} />}
                          onClick={() => setDeleteDoc(doc)}
                        />
                      </HStack>
                    }
                  />
                ))}
              </List>
            </Card>
          )}
        </VStack>
      </LayoutContent>

      <PreviewDialog
        doc={previewDoc}
        autoPrint={autoPrintPreview}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDoc(null);
            setAutoPrintPreview(false);
          }
        }}
      />
      <CoverLetterDialog doc={coverDoc} onOpenChange={setCoverDoc} />
      <TailorDialog doc={tailorDoc} onOpenChange={setTailorDoc} />

      <TemplateGallery
        isOpen={!!galleryDoc}
        onOpenChange={(open) => !open && setGalleryDoc(null)}
        settings={galleryDoc?.data?.resumeSettings}
        onSelect={(patch) => galleryDoc && updateSettings(galleryDoc, patch)}
      />
      <TemplateCustomize
        isOpen={!!customizeDoc}
        onOpenChange={(open) => !open && setCustomizeDoc(null)}
        settings={customizeDoc?.data?.resumeSettings}
        onSelect={(patch) =>
          customizeDoc && updateSettings(customizeDoc, patch)
        }
      />

      <Dialog
        isOpen={!!deleteDoc}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        width={420}
        padding={2}
      >
        <DialogHeader
          title="Delete this resume?"
          subtitle={
            deleteDoc
              ? `"${nameOf(deleteDoc)}" will be removed from this browser. This cannot be undone.`
              : ""
          }
          onOpenChange={(open) => !open && setDeleteDoc(null)}
        />
        <VStack gap={3} width="100%" padding={2}>
          <HStack justify="end" width="100%" gap={2}>
            <Button
              variant="ghost"
              size="sm"
              label="Cancel"
              onClick={() => setDeleteDoc(null)}
            />
            <Button
              variant="destructive"
              size="sm"
              icon={<Trash2 size={14} />}
              label="Delete"
              onClick={() => deleteDoc && remove(deleteDoc)}
            />
          </HStack>
        </VStack>
      </Dialog>
    </Layout>
  );
};

export default ResumesDashboard;
