import React from "react";
import { Resume } from "@features/resume/Resume";
import { useStore } from "@store";

export const ResumePreview = ({ interactive, onEditSection }) => {
  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const resumeSummary = useStore((state) => state.resumeSummary);
  const workHistory = useStore((state) => state.workHistory);
  const education = useStore((state) => state.education);
  const skills = useStore((state) => state.skills);
  const additionalSections = useStore((state) => state.additionalSections);
  const resumeSettings = useStore((state) => state.resumeSettings);

  const data = {
    pd: personalDetails,
    socialLinks,
    summary: resumeSummary,
    experience: workHistory,
    education,
    skills,
    extras: additionalSections,
  };

  return (
    <Resume
      data={data}
      templateId={resumeSettings.templateId}
      paletteId={resumeSettings.paletteId}
      fontId={resumeSettings.fontId}
      settings={resumeSettings}
      interactive={interactive}
      onEditSection={onEditSection}
    />
  );
};

export default ResumePreview;