import React, { useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Printer, FileDown } from "lucide-react";
import { useStore } from "@store";
import { downloadCoverLetterPdf } from "@features/export/pdf";
import { downloadCoverLetterDocx } from "@features/export/docx-letter";
import {
  LETTER_TEMPLATES,
  applyLetterTemplate,
} from "@features/resume/letterTemplates";
import CoverLetterSheet from "../preview/CoverLetterSheet";
import RichTextEditor from "../ui/RichTextEditor";

const CoverLetterEditor = () => {
  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const coverLetter = useStore((state) => state.coverLetter);
  const setCoverLetter = useStore((state) => state.setCoverLetter);
  const resumeSettings = useStore((state) => state.resumeSettings);
  const setResumeSettings = useStore((state) => state.setResumeSettings);
  const letterRef = useRef(null);
  const [exportError, setExportError] = useState("");

  const handleDownloadPdf = async () => {
    setExportError("");
    try {
      await downloadCoverLetterPdf({
        personalDetails,
        socialLinks,
        coverLetter,
        fontId: resumeSettings.fontId,
        paperSize: resumeSettings.paperSize,
      });
    } catch (error) {
      setExportError(
        error?.message || "PDF export failed. Try again in a moment.",
      );
    }
  };

  const handleDownloadDocx = async () => {
    setExportError("");
    try {
      await downloadCoverLetterDocx(
        { pd: personalDetails, settings: resumeSettings },
        coverLetter,
      );
    } catch (error) {
      setExportError(error?.message || "DOCX export failed.");
    }
  };

  const name = [personalDetails.firstName, personalDetails.lastName]
    .filter(Boolean)
    .join(" ") || "";

  const extraContext = [
    `Applicant: ${name}`,
    personalDetails.designation && `Job title: ${personalDetails.designation}`,
    coverLetter.recipient && `Recipient: ${coverLetter.recipient}`,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div className="editor-letter-grid">
      <Card padding={4} width="100%">
        <VStack gap={3} width="100%">
          <VStack gap={0}>
            <Text type="inherit" size="lg" weight="semibold" color="primary">
              Cover letter
            </Text>
            <Text type="inherit" size="sm" color="secondary">
              Optional — hidden from your resume.
            </Text>
          </VStack>
          <HStack gap={1} wrap>
            {LETTER_TEMPLATES.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={
                  resumeSettings.letterTemplateId === t.id
                    ? "primary"
                    : "secondary"
                }
                label={t.name}
                onClick={() =>
                  setResumeSettings(applyLetterTemplate(resumeSettings, t.id))
                }
              />
            ))}
          </HStack>
          <TextInput
            label="Recipient"
            value={coverLetter.recipient}
            onChange={(v) => setCoverLetter({ recipient: v })}
            placeholder="Hiring Manager, Acme Corp"
          />
          <VStack gap={1} width="100%">
            <Text type="inherit" size="sm" weight="medium" color="primary">
              Body
            </Text>
            <RichTextEditor
              value={coverLetter.body}
              onChange={(html) => setCoverLetter({ body: html })}
              minHeight={320}
              placeholder="Dear hiring manager, …"
              extraContext={extraContext}
            />
          </VStack>
        </VStack>
      </Card>
      <div className="editor-letter-preview">
        <VStack gap={3} width="100%">
          <HStack justify="end" align="center" width="100%" wrap>
            {exportError ? (
              <Text type="inherit" size="sm" color="accent" role="alert">
                {exportError}
              </Text>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              icon={<FileDown size={14} />}
              label="DOCX"
              onClick={handleDownloadDocx}
            />
            <Button
              variant="primary"
              size="sm"
              icon={<Printer size={14} />}
              label="Download PDF"
              onClick={handleDownloadPdf}
            />
          </HStack>
          <div className="letter-preview-scroll">
            <Card padding={5} width="100%" className="letter-paper-wrap">
              <CoverLetterSheet
                personalDetails={personalDetails}
                socialLinks={socialLinks}
                coverLetter={coverLetter}
                letterRef={letterRef}
                align={resumeSettings.letterHeaderAlign || "left"}
              />
            </Card>
          </div>
        </VStack>
      </div>
    </div>
  );
};

export default CoverLetterEditor;
