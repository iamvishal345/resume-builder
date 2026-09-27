import { useRef } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useStore } from "@store";
import {
  LETTER_TEMPLATES,
  applyLetterTemplate,
} from "@features/resume/letterTemplates";
import { useI18n } from "@features/i18n/useI18n";
import CoverLetterSheet from "../preview/CoverLetterSheet";
import RichTextEditor from "../ui/RichTextEditor";

const CoverLetterEditor = () => {
  const { t } = useI18n();
  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const coverLetter = useStore((state) => state.coverLetter);
  const setCoverLetter = useStore((state) => state.setCoverLetter);
  const resumeSettings = useStore((state) => state.resumeSettings);
  const setResumeSettings = useStore((state) => state.setResumeSettings);
  const letterRef = useRef(null);

  const name =
    [personalDetails.firstName, personalDetails.lastName]
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
      <Card padding={4} width="100%" className="editor-letter-card">
        <VStack gap={3} width="100%">
          <VStack gap={0}>
            <Text type="inherit" size="lg" weight="semibold" color="primary">
              {t("coverLetter.title")}
            </Text>
            <Text type="inherit" size="sm" color="secondary">
              {t("coverLetter.subtitle")}
            </Text>
          </VStack>

          <VStack gap={1} width="100%">
            <Text type="inherit" size="xs" weight="medium" color="secondary">
              {t("coverLetter.templateStyle")}
            </Text>
            <HStack gap={1} wrap="wrap">
              {LETTER_TEMPLATES.map((tmpl) => (
                <Button
                  key={tmpl.id}
                  size="sm"
                  variant={
                    resumeSettings.letterTemplateId === tmpl.id
                      ? "primary"
                      : "secondary"
                  }
                  label={tmpl.name}
                  onClick={() =>
                    setResumeSettings(
                      applyLetterTemplate(resumeSettings, tmpl.id),
                    )
                  }
                />
              ))}
            </HStack>
          </VStack>

          <TextInput
            label={t("coverLetter.recipient")}
            value={coverLetter.recipient}
            onChange={(v) => setCoverLetter({ recipient: v })}
            placeholder={
              t("coverLetter.recipientPlaceholder") ||
              "Hiring Manager, Acme Corp"
            }
          />

          <VStack gap={1} width="100%">
            <Text type="inherit" size="sm" weight="medium" color="primary">
              {t("coverLetter.body")}
            </Text>
            <RichTextEditor
              value={coverLetter.body}
              onChange={(html) => setCoverLetter({ body: html })}
              minHeight={280}
              placeholder={
                t("coverLetter.bodyPlaceholder") || "Dear hiring manager, …"
              }
              extraContext={extraContext}
            />
          </VStack>
        </VStack>
      </Card>

      <div className="editor-letter-preview">
        <Card padding={4} width="100%" className="letter-paper-wrap">
          <CoverLetterSheet
            personalDetails={personalDetails}
            socialLinks={socialLinks}
            coverLetter={coverLetter}
            letterRef={letterRef}
            align={resumeSettings.letterHeaderAlign || "left"}
          />
        </Card>
      </div>
    </div>
  );
};

export default CoverLetterEditor;
