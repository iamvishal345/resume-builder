import { useRef, useState } from "react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Download, Pencil, Mail } from "lucide-react";
import { defaultResumeData } from "@store";
import { downloadCoverLetterPdf } from "@features/export/pdf";
import CoverLetterSheet from "../preview/CoverLetterSheet";
import { nameOf } from "./resumeMeta";

const LetterDialog = ({ doc, onOpenChange }) => {
  const sheetRef = useRef(null);
  const [error, setError] = useState("");
  const data = { ...defaultResumeData(), ...(doc?.data || {}) };
  const hasContent = Boolean(
    doc && (data.coverLetter.recipient || data.coverLetter.body),
  );
  const download = async () => {
    setError("");
    try {
      await downloadCoverLetterPdf({
        personalDetails: data.personalDetails,
        socialLinks: data.socialLinks,
        coverLetter: data.coverLetter,
        fontId: data.resumeSettings?.fontId,
      });
    } catch (err) {
      setError(err?.message || "PDF download failed.");
    }
  };

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
              {error ? (
                <Text type="inherit" size="sm" color="accent" role="alert">
                  {error}
                </Text>
              ) : null}
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

export default LetterDialog;
