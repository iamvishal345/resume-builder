import React, { useRef } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { ArrowLeft, Printer } from "lucide-react";
import { useStore } from "@store";
import { downloadCoverLetterPdf } from "@features/export/pdf";
import CoverLetterSheet from "../preview/CoverLetterSheet";
import RichTextEditor from "../ui/RichTextEditor";

const CoverLetterEditor = ({ onBack }) => {
  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const coverLetter = useStore((state) => state.coverLetter);
  const setCoverLetter = useStore((state) => state.setCoverLetter);
  const letterRef = useRef(null);

  const handleDownloadPdf = () => {
    downloadCoverLetterPdf({
      personalDetails,
      socialLinks,
      coverLetter,
    }).catch((error) => console.error("PDF export failed", error));
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
    <Grid columns={12} gap={4} width="100%" className="editor-grid">
      <GridSpan columns={5} style={{ minWidth: 260 }}>
        <Card padding={4} width="100%">
          <VStack gap={3} width="100%">
            <HStack justify="between" align="center" width="100%">
              <VStack gap={0}>
                <Text type="inherit" size="lg" weight="semibold" color="primary">
                  Cover letter
                </Text>
                <Text type="inherit" size="sm" color="secondary">
                  Optional — hidden from your resume.
                </Text>
              </VStack>
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={15} />}
                label="Back to resume"
                onClick={onBack}
              />
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
                minHeight={380}
                placeholder="Dear hiring manager, …"
                extraContext={extraContext}
              />
            </VStack>
          </VStack>
        </Card>
      </GridSpan>
      <GridSpan columns={7} style={{ minWidth: 300 }}>
        <VStack gap={3} width="100%">
          <HStack justify="end" align="center" width="100%">
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
              />
            </Card>
          </div>
        </VStack>
      </GridSpan>
    </Grid>
  );
};

export default CoverLetterEditor;