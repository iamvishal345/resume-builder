import React from "react";
import { VStack } from "@astryxdesign/core/Layout";
import { StepCard } from "./StepLayout";
import { useStore } from "@store";
import { useI18n } from "@features/i18n/useI18n";
import RichTextEditor from "../../ui/RichTextEditor";

function Summary({ onNext, onPrev, nextLabel }) {
  const { t } = useI18n();
  const resumeSummary = useStore((state) => state.resumeSummary);
  const setResumeSummary = useStore((state) => state.setResumeSummary);
  const personalDetails = useStore((state) => state.personalDetails);
  return (
    <StepCard
      title={t("steps.summary") || "Summary"}
      description={
        t("summary.description") ||
        "Summarize your work experience, education and skills here."
      }
      onNext={onNext}
      onPrev={onPrev}
      nextLabel={nextLabel}
    >
      <VStack gap={3} width="100%">
        <RichTextEditor
          value={resumeSummary || ""}
          minHeight={260}
          placeholder={
            t("summary.placeholder") ||
            "A good summary for a resume starts with a positive character trait and includes your job title, key skills, and the highlights of your career in just 2–5 sentences tailored to a specific position"
          }
          onChange={setResumeSummary}
          extraContext={`Name: ${personalDetails.firstName || ""} ${personalDetails.lastName || ""}\nJob title: ${personalDetails.designation || ""}`}
        />
      </VStack>
    </StepCard>
  );
}

export default Summary;
