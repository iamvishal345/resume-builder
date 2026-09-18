import { useState } from "react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Briefcase, Download } from "lucide-react";
import {
  buildInterviewPacket,
  defaultTalkingPointsFromJd,
} from "@features/resumes/interviewPacket";
import { triggerDownload } from "@features/resumes/backup";
import { downloadResumePdf, downloadCoverLetterPdf } from "@features/export/pdf";
import { resumeViewModel } from "@features/resume/viewModel";
import { nameOf } from "./resumeMeta";

const InterviewPacketDialog = ({ doc, onOpenChange }) => {
  const [jd, setJd] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const exportPacket = async ({ withPdfs } = {}) => {
    if (!doc) return;
    setBusy(true);
    setError("");
    try {
      const talkingPoints = [
        ...defaultTalkingPointsFromJd(jd),
        ...notes
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      ];
      const packet = buildInterviewPacket({
        resumeDoc: doc,
        jobDescription: jd,
        talkingPoints,
        coverLetter: doc.data?.coverLetter,
      });
      const blob = new Blob([JSON.stringify(packet, null, 2)], {
        type: "application/json",
      });
      triggerDownload(
        blob,
        `${(nameOf(doc) || "interview").toLowerCase().replace(/\s+/g, "-")}-packet.json`,
      );
      if (withPdfs) {
        const raw = doc.data || {};
        const data = resumeViewModel(raw);
        await downloadResumePdf({
          data,
          templateId: raw.resumeSettings?.templateId,
          paletteId: raw.resumeSettings?.paletteId,
          fontId: raw.resumeSettings?.fontId,
          settings: raw.resumeSettings || {},
        });
        if (doc.data?.coverLetter?.body) {
          await downloadCoverLetterPdf({
            personalDetails: raw.personalDetails || {},
            socialLinks: raw.socialLinks || [],
            coverLetter: raw.coverLetter,
            fontId: raw.resumeSettings?.fontId,
          });
        }
      }
      onOpenChange(null);
    } catch (e) {
      setError(e?.message || "Could not build packet.");
    } finally {
      setBusy(false);
    }
  };

  return (
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
            title="Interview packet"
            subtitle={`Local pack for "${nameOf(doc)}" — JSON (+ optional PDFs). Nothing is uploaded.`}
            onOpenChange={() => !busy && onOpenChange(null)}
          />
          <div className="r-gallery-scroll">
            <VStack gap={3} width="100%" padding={2}>
              <TextArea
                label="Job description (optional)"
                value={jd}
                onChange={setJd}
                rows={6}
                width="100%"
                placeholder="Paste the JD to auto-suggest talking points…"
              />
              <TextArea
                label="Your notes / talking points"
                value={notes}
                onChange={setNotes}
                rows={4}
                width="100%"
                placeholder="One point per line"
              />
              {error && (
                <Text type="inherit" size="sm" color="accent" role="alert">
                  {error}
                </Text>
              )}
              <HStack justify="end" gap={2} wrap>
                <Button
                  size="sm"
                  variant="ghost"
                  label="Cancel"
                  onClick={() => onOpenChange(null)}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Download size={14} />}
                  label={busy ? "…" : "JSON only"}
                  disabled={busy}
                  onClick={() => exportPacket({ withPdfs: false })}
                />
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Briefcase size={14} />}
                  label={busy ? "Working…" : "JSON + PDFs"}
                  disabled={busy}
                  onClick={() => exportPacket({ withPdfs: true })}
                />
              </HStack>
            </VStack>
          </div>
        </>
      )}
    </Dialog>
  );
};

export default InterviewPacketDialog;
