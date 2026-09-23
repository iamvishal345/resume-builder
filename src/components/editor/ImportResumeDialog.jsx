import { useMemo, useState } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { FileInput } from "@astryxdesign/core/FileInput";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Upload, FileUp, FileText, CheckCircle2 } from "lucide-react";
import { defaultResumeData, useStore, resumeDataOf } from "@store";
import { parseResumeText } from "@features/import/parse";
import { toSkillList } from "@features/resume/skillList";
import {
  extractTextFromFile,
  isJsonBackupFile,
} from "@features/import/extract";
import { parseResumeBackup } from "@features/resumes/backup";
import { snapshotBefore } from "@features/resumes/snapshot";

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

const ImportResumeDialog = ({ isOpen, onOpenChange }) => {
  const [text, setText] = useState("");
  const [fileValue, setFileValue] = useState(null);
  const [fileStatus, setFileStatus] = useState(null);
  const [busy, setBusy] = useState(false);
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
  const applyResumeData = useStore((state) => state.applyResumeData);

  const parsed = useMemo(() => parseResumeText(text), [text]);
  const hasContent =
    parsed.pd.firstName ||
    parsed.summary ||
    parsed.experience.length ||
    parsed.education.length ||
    parsed.skills.length ||
    parsed.extras.length;

  const reset = () => {
    setText("");
    setFileValue(null);
    setFileStatus(null);
    setBusy(false);
    onOpenChange(false);
  };

  const apply = async () => {
    await snapshotBeforeImport();
    replacePersonalDetails({ ...parsed.pd });
    setResumeSummary(parsed.summary);
    if (parsed.experience.length) setWorkHistory(parsed.experience);
    if (parsed.education.length) setEducation(parsed.education);
    if (parsed.skills.length) setSkills(toSkillList(parsed.skills));
    if (parsed.extras.length) setAdditionalSections(parsed.extras);
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
        const merged = { ...defaultResumeData(), ...result.doc.data };
        applyResumeData(merged);
        reset();
      } catch {
        setFileStatus({
          type: "error",
          message: "Could not import that JSON backup.",
        });
      }
    };
    reader.onerror = () =>
      setFileStatus({ type: "error", message: "Could not read that file." });
    reader.readAsText(file);
  };

  const onFileChange = async (file) => {
    if (!file) {
      setFileValue(null);
      setFileStatus(null);
      return;
    }
    setFileValue(file);
    if (isJsonBackupFile(file)) {
      setFileStatus({ type: "success", message: "Importing backup…" });
      restoreJsonBackup(file);
      return;
    }
    setBusy(true);
    setFileStatus({ type: "success", message: "Extracting text…" });
    try {
      const extracted = await extractTextFromFile(file);
      setText(extracted);
      setFileStatus({
        type: "success",
        message: `Read ${extracted.length.toLocaleString()} characters — review the preview below, then import.`,
      });
    } catch (e) {
      setFileStatus({
        type: "error",
        message: e && e.message ? e.message : "Could not read that file.",
      });
    } finally {
      setBusy(false);
    }
  };

  const sectionsFound = parsed.sections.length;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width={700}
      maxHeight="86dvh"
      padding={2}
    >
      <DialogHeader
        title="Import a resume"
        subtitle="Upload a PDF, DOCX, or backup file — or paste plain text. Everything runs locally in your browser; template and colors stay untouched."
        onOpenChange={onOpenChange}
      />
      <div className="r-gallery-scroll">
        <VStack gap={3} width="100%" padding={2}>
          <FileInput
            label="Existing resume"
            mode="dropzone"
            value={fileValue}
            onChange={onFileChange}
            accept=".pdf,.docx,.txt,.md,.html,.json,.r.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json"
            isMultiple={false}
            isDisabled={busy}
            isLoading={busy}
            placeholder="Drop a PDF, DOCX, text file, or .r.json backup"
            description="PDF and DOCX text is extracted locally. A .r.json backup restores the full document including template and colors."
            status={fileStatus}
            width="100%"
          />

          {!text.trim() && !fileValue && (
            <HStack gap={1} align="center">
              <FileText size={15} color="var(--color-secondary)" />
              <Text type="inherit" size="sm" color="secondary">
                or paste the text of an existing resume below.
              </Text>
            </HStack>
          )}

          <TextArea
            label="…or paste resume text"
            value={text}
            onChange={(v) => setText(v)}
            rows={9}
            width="100%"
            placeholder={
              "Ada Lovelace\nEngineer\nada@example.com · +1 555 010 9999\n\nSUMMARY\n...\n\nEXPERIENCE\nEngineer at Acme — 2020 - Present\n- Shipped ...\n\nEDUCATION\nB.Sc. Computer Science — MIT, 2016\n\nSKILLS\nPython, SQL, React"
            }
          />

          {text.trim() ? (
            <HStack justify="between" align="center" width="100%">
              <HStack gap={1} align="center">
                <CheckCircle2 size={16} color="var(--color-success)" />
                <Text type="inherit" size="sm" weight="medium" color="primary">
                  {parsed.pd.firstName || "Name"} · {sectionsFound} section
                  {sectionsFound === 1 ? "" : "s"} · {parsed.experience.length}{" "}
                  job{parsed.experience.length === 1 ? "" : "s"} ·{" "}
                  {parsed.education.length} education · {parsed.skills.length}{" "}
                  skills
                </Text>
              </HStack>
              <Button
                variant="primary"
                size="sm"
                icon={<FileUp size={14} />}
                label="Import & replace"
                disabled={!hasContent}
                onClick={apply}
              />
            </HStack>
          ) : (
            <HStack gap={1} align="center">
              <Upload size={15} color="var(--color-secondary)" />
              <Text type="inherit" size="sm" color="secondary">
                Nothing is uploaded — all parsing happens in your browser.
              </Text>
            </HStack>
          )}

          {text.trim() && !hasContent && (
            <Text type="inherit" size="sm" color="secondary">
              No recognizable sections yet — add headers like SUMMARY,
              EXPERIENCE, EDUCATION and SKILLS.
            </Text>
          )}
        </VStack>
      </div>
    </Dialog>
  );
};

export default ImportResumeDialog;
