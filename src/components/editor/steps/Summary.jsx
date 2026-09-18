import React from "react";
import { VStack } from "@astryxdesign/core/Layout";
import { StepCard } from "./StepLayout";
import { useStore } from "@store";
import RichTextEditor from "../../ui/RichTextEditor";

function Summary({ onNext, onPrev, nextLabel }) {
  const resumeSummary = useStore((state) => state.resumeSummary);
  const setResumeSummary = useStore((state) => state.setResumeSummary);
  const personalDetails = useStore((state) => state.personalDetails);
  return (
    <StepCard
      title="Write About Yourself"
      description="Summarize your work experience, education and skills here."
      onNext={onNext}
      onPrev={onPrev}
      nextLabel={nextLabel}
    >
      <VStack gap={3} width="100%">
        <RichTextEditor
          value={resumeSummary || ""}
          minHeight={240}
          placeholder="A good summary for a resume starts with a positive character trait and includes your job title, key skills, and the highlights of your career in just 2–5 sentences tailored to a specific position"
          onChange={setResumeSummary}
          extraContext={`Name: ${personalDetails.firstName || ""} ${personalDetails.lastName || ""}\nJob title: ${personalDetails.designation || ""}`}
        />
      </VStack>
    </StepCard>
  );
}

export default Summary;