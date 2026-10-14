import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { FileInput } from "@astryxdesign/core/FileInput";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { FileUp, Sparkles } from "lucide-react";
import { defaultResumeData, useStore, resumeDataOf } from "@store";
import { toSkillList } from "@features/resume/skillList";
import {
  extractTextFromFile,
  isJsonBackupFile,
} from "@features/import/extract";
import {
  mapLocalResumeText,
  parseResumeImport,
  previewOf,
} from "@features/import/pdfResume";
import { isAiAvailable } from "@features/ai/provider";
import { parseResumeBackup } from "@features/resumes/backup";
import { snapshotBefore } from "@features/resumes/snapshot";
import { useI18n } from "@features/i18n/useI18n";
import AiSettingsDialog from "../ai/AiSettingsDialog";

const PDF_ERROR_KEYS = {
  empty: "import.emptyPdf",
  "image-only": "import.imageOnly",
  encrypted: "import.encryptedPdf",
  unreadable: "import.unreadablePdf",
};

const snapshotBeforeImport = async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("resume");
  if (!id) return;
  await snapshotBefore(
    id,
    resumeDataOf(useStore.getState()),
    `Before import · ${new Date().toLocaleString()}`,
  );
};

const MIN_AUTO_AI = 20;

const countPhrase = (t, count, oneKey, manyKey) =>
  t(count === 1 ? oneKey : manyKey, { count });

const importSummary = (t, preview) => {
  const name = preview.name || t("import.noName");
  const who = preview.role ? `${name} · ${preview.role}` : name;
  const counts = [
    countPhrase(t, preview.jobs, "import.countJob", "import.countJobs"),
    t("import.countEducation", { count: preview.education }),
    countPhrase(t, preview.skills, "import.countSkill", "import.countSkills"),
  ].join(" · ");
  return { who, counts };
};

const aiFailureMessage = (t, reason) => {
  if (
    reason &&
    reason !== "no-ai" &&
    reason !== "empty" &&
    reason !== "failed" &&
    reason !== "not-json" &&
    reason !== "not-object" &&
    reason !== "no-resume-content" &&
    reason !== "too-large" &&
    !/Failed to fetch/i.test(reason) &&
    !/user gesture|downloadable|downloading/i.test(reason)
  ) {
    return reason;
  }
  return (
    t("import.aiFailed") ||
    "AI couldn't structure that file. The local read is still here — review it and import, or try again."
  );
};

const ImportResumeDialog = ({ isOpen, onOpenChange }) => {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [fileValue, setFileValue] = useState(null);
  const [fileStatus, setFileStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [aiRev, setAiRev] = useState(0);
  const replacePersonalDetails = useStore(
    (state) => state.replacePersonalDetails,
  );
  const setResumeSummary = useStore((state) => state.setResumeSummary);
  const setWorkHistory = useStore((state) => state.setWorkHistory);
  const setEducation = useStore((state) => state.setEducation);
  const setSkills = useStore((state) => state.setSkills);
  const setAdditionalSections = useStore(
    (state) => state.setAdditionalSections,
  );
  const setSocialLinks = useStore((state) => state.setSocialLinks);
  const applyResumeData = useStore((state) => state.applyResumeData);
  const requestRef = useRef(0);
  const attemptedRef = useRef("");
  const textRef = useRef(text);
  const openRef = useRef(isOpen);
  const structureRef = useRef(async () => {});
  textRef.current = text;
  openRef.current = isOpen;

  const hasAi = useMemo(() => isOpen && isAiAvailable(), [isOpen, aiRev]);
  const local = useMemo(() => mapLocalResumeText(text), [text]);
  const usingAi = Boolean(aiResult?.ok && aiResult.sourceText === text);
  const active = usingAi ? aiResult : local;
  const preview = active.preview || previewOf(active.data || {});
  const summary = text.trim() ? importSummary(t, preview) : null;

  const reset = () => {
    requestRef.current += 1;
    attemptedRef.current = "";
    setText("");
    setFileValue(null);
    setFileStatus(null);
    setBusy(false);
    setAiBusy(false);
    setAiResult(null);
    setAiError("");
    onOpenChange(false);
  };

  const applyMapped = async (mapped) => {
    await snapshotBeforeImport();
    replacePersonalDetails({ ...(mapped.personalDetails || {}) });
    setResumeSummary(mapped.resumeSummary || "");
    if (mapped.workHistory?.length) setWorkHistory(mapped.workHistory);
    if (mapped.education?.length) setEducation(mapped.education);
    if (mapped.skills?.length) setSkills(toSkillList(mapped.skills));
    if (mapped.additionalSections?.length) {
      setAdditionalSections(mapped.additionalSections);
    }
    if (mapped.socialLinks?.length) setSocialLinks(mapped.socialLinks);
    reset();
  };

  const restoreJsonBackup = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = parseResumeBackup(String(reader.result));
        if (!result.ok) {
          setFileStatus({ type: "error", message: result.error });
          return;
        }
        await snapshotBeforeImport();
        if (result.kind === "json-resume") {
          applyResumeData({ ...defaultResumeData(), ...result.data });
          reset();
          return;
        }
        if (result.kind !== "resume" || !result.doc?.data) {
          setFileStatus({
            type: "error",
            message: t("import.backupPackError") || "This backup is a full library pack — restore it from My resumes → Data & privacy.",
          });
          return;
        }
        const merged = { ...defaultResumeData(), ...result.doc.data };
        applyResumeData(merged);
        reset();
      } catch {
        setFileStatus({
          type: "error",
          message: t("import.importJsonError") || "Could not import that JSON backup.",
        });
      }
    };
    reader.onerror = () =>
      setFileStatus({ type: "error", message: t("import.readError") || "Could not read that file." });
    reader.readAsText(file);
  };

  const onFileChange = async (file) => {
    if (!file) {
      setFileValue(null);
      setFileStatus(null);
      return;
    }
    setFileValue(file);
    setAiResult(null);
    setAiError("");
    if (isJsonBackupFile(file)) {
      setFileStatus({ type: "success", message: t("import.importingBackup") || "Importing backup…" });
      restoreJsonBackup(file);
      return;
    }
    setBusy(true);
    setText("");
    setFileStatus({ type: "success", message: t("import.extractingText") || "Extracting text…" });
    try {
      const extracted = await extractTextFromFile(file);
      setText(extracted);
      setFileStatus({ type: "success" });
    } catch (e) {
      const key = PDF_ERROR_KEYS[e?.code];
      setFileStatus({
        type: "error",
        message: key
          ? t(key) || e.message
          : e && e.message
            ? e.message
            : (t("import.readError") || "Could not read that file."),
      });
    } finally {
      setBusy(false);
    }
  };

  structureRef.current = async (sourceText, { manual = false } = {}) => {
    const trimmed = String(sourceText || "").trim();
    if (!trimmed) return;
    const requestId = ++requestRef.current;
    attemptedRef.current = sourceText;
    setAiBusy(true);
    setAiError("");
    try {
      const result = await parseResumeImport(sourceText);
      if (requestId !== requestRef.current || !openRef.current) return;
      if (sourceText !== textRef.current) return;
      if (result.source === "ai" && result.ok) {
        setAiResult({ ...result, sourceText });
        return;
      }
      setAiResult(null);
      const quiet =
        !manual &&
        /user gesture|downloadable|downloading/i.test(result.aiReason || "");
      if (result.attemptedAi && !quiet) {
        setAiError(aiFailureMessage(t, result.aiReason));
      }
    } catch (e) {
      if (requestId !== requestRef.current || !openRef.current) return;
      if (sourceText !== textRef.current) return;
      setAiResult(null);
      const quiet =
        !manual && /user gesture|downloadable|downloading/i.test(e?.message || "");
      if (!quiet) setAiError(aiFailureMessage(t, e?.message || ""));
    } finally {
      if (requestId === requestRef.current) setAiBusy(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      requestRef.current += 1;
      setAiBusy(false);
      return undefined;
    }
    if (!hasAi) return undefined;
    if (text.trim().length < MIN_AUTO_AI) return undefined;
    if (attemptedRef.current === text) return undefined;
    const handle = setTimeout(() => {
      if (attemptedRef.current === text) return;
      void structureRef.current(text);
    }, 500);
    return () => clearTimeout(handle);
  }, [isOpen, hasAi, text]);

  const onTextChange = (value) => {
    setText(value);
    setAiError("");
    if (aiResult && aiResult.sourceText !== value) setAiResult(null);
  };

  const statusLine = aiError
    ? aiError
    : aiBusy
      ? t("import.structuring") || "Structuring…"
      : usingAi
        ? t("import.parsedWithAi")
        : "";

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        width={700}
        maxHeight="86dvh"
        padding={6}
      >
        <DialogHeader
          title={t("import.title") || "Import a resume"}
          onOpenChange={onOpenChange}
        />
        <div className="r-gallery-scroll">
          <VStack gap={6} width="100%" padding={5}>
            <FileInput
              label={t("import.existingLabel") || "Existing resume"}
              mode="dropzone"
              value={fileValue}
              onChange={onFileChange}
              accept=".pdf,.docx,.txt,.md,.html,.json,.r.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json"
              isMultiple={false}
              isDisabled={busy || aiBusy}
              isLoading={busy}
              placeholder={t("import.placeholder") || "Drop a PDF or DOCX"}
              description={
                t("import.dropzoneDesc") ||
                "PDF or DOCX is read on this device."
              }
              status={fileStatus}
              width="100%"
            />

            <TextArea
              label={t("import.pasteLabel") || "Paste resume text"}
              value={text}
              onChange={onTextChange}
              rows={9}
              width="100%"
              isDisabled={aiBusy}
              placeholder={t("import.pastePlaceholder") || "Ada Lovelace\nEngineer\nada@example.com · +1 555 010 9999\n\nSUMMARY\n...\n\nEXPERIENCE\nEngineer at Acme — 2020 - Present\n- Shipped ...\n\nEDUCATION\nB.Sc. Computer Science — MIT, 2016\n\nSKILLS\nPython, SQL, React"}
            />

            {summary ? (
              <VStack gap={1} width="100%">
                <Text type="inherit" size="sm" weight="semibold" color="primary">
                  {summary.who}
                </Text>
                <Text type="inherit" size="sm" color="secondary">
                  {summary.counts}
                </Text>
                {statusLine ? (
                  <Text
                    type="inherit"
                    size="sm"
                    color={aiError ? "accent" : "secondary"}
                    role={aiError ? "alert" : "status"}
                  >
                    {statusLine}
                  </Text>
                ) : null}
              </VStack>
            ) : null}

            <HStack gap={2} align="center">
              <Button
                variant="secondary"
                size="sm"
                icon={<Sparkles size={14} />}
                label={t("import.parseWithAi") || "Parse with AI"}
                isLoading={aiBusy}
                disabled={hasAi && (aiBusy || busy || !text.trim())}
                onClick={() => {
                  if (!hasAi) {
                    setAiSettingsOpen(true);
                    return;
                  }
                  void structureRef.current(text, { manual: true });
                }}
              />
              {text.trim() ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FileUp size={14} />}
                  label={t("import.importReplace") || "Import & replace"}
                  disabled={!active.ok}
                  onClick={() => applyMapped(active.data)}
                />
              ) : null}
            </HStack>
          </VStack>
        </div>
      </Dialog>
      <AiSettingsDialog
        isOpen={aiSettingsOpen}
        onOpenChange={(open) => {
          setAiSettingsOpen(open);
          if (!open) setAiRev((rev) => rev + 1);
        }}
      />
    </>
  );
};

export default ImportResumeDialog;
