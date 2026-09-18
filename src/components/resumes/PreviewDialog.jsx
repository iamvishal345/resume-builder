import { useEffect, useRef, useState } from "react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Download, Pencil } from "lucide-react";
import { defaultResumeData } from "@store";
import { Resume } from "@features/resume/Resume";
import { resumeViewModel } from "@features/resume/viewModel";
import { downloadResumePdf } from "@features/export/pdf";
import { nameOf } from "./resumeMeta";

const PreviewDialog = ({ doc, autoPrint, onOpenChange }) => {
  const sheetRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (autoPrint && doc) {
      const id = window.setTimeout(() => {
        const current = { ...defaultResumeData(), ...(doc.data || {}) };
        downloadResumePdf({
          data: resumeViewModel(current),
          templateId: current.resumeSettings.templateId,
          paletteId: current.resumeSettings.paletteId,
          fontId: current.resumeSettings.fontId,
          settings: current.resumeSettings,
        })
          .then(() => onOpenChange(null))
          .catch((err) => {
            setError(err?.message || "PDF download failed.");
          });
      }, 250);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [autoPrint, doc?.id, onOpenChange]);

  const raw = { ...defaultResumeData(), ...(doc?.data || {}) };
  const data = resumeViewModel(raw);
  const download = async () => {
    setError("");
    try {
      await downloadResumePdf({
        data,
        templateId: raw.resumeSettings.templateId,
        paletteId: raw.resumeSettings.paletteId,
        fontId: raw.resumeSettings.fontId,
        settings: raw.resumeSettings,
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
              {error ? (
                <Text type="inherit" size="sm" color="accent" role="alert">
                  {error}
                </Text>
              ) : null}
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

export default PreviewDialog;
