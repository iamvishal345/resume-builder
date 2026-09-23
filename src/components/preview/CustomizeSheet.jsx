import React, { useEffect } from "react";
import { Resume } from "@features/resume/Resume";
import { resumeViewModel } from "@features/resume/viewModel";
import { defaultResumeData } from "@store";
import TemplateCustomize from "./TemplateCustomize";
import "./customize-panel.css";

/**
 * Full-screen-ish sheet: left customize panel + live resume preview.
 * Used from Dashboard (and any place without an existing preview column).
 */
const CustomizeSheet = ({
  isOpen,
  onOpenChange,
  settings,
  onSelect,
  sections = [],
  docData,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const raw = { ...defaultResumeData(), ...(docData || {}) };
  const data = resumeViewModel(raw);
  const rs = settings || raw.resumeSettings || {};

  return (
    <div
      className="tcx-sheet-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div
        className="tcx-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Layout and theme"
      >
        <div className="tcx-sheet-panel">
          <TemplateCustomize
            settings={rs}
            onSelect={onSelect}
            sections={sections}
            onClose={() => onOpenChange(false)}
          />
        </div>
        <div className="tcx-sheet-preview" aria-label="Live resume preview">
          <div className="preview-sheet-wrap">
            <div className="preview-sheet-container">
              <Resume
                data={data}
                templateId={rs.templateId}
                paletteId={rs.paletteId}
                fontId={rs.fontId}
                settings={rs}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeSheet;
