import { useMemo } from "react";
import { Resume } from "@features/resume/Resume";
import { SAMPLE_RESUME } from "@features/resume/sample";
import {
  resolveTemplate,
  settingsFromTemplate,
} from "@features/resume/templates";

/**
 * Static marketing preview — real resume canvas, not a mock illustration.
 * Non-interactive; scales via CSS transform so A4 stays sharp.
 */
const MarketingPreview = ({ templateId = "cascade" }) => {
  const template = resolveTemplate(templateId);
  const settings = useMemo(
    () => settingsFromTemplate(template),
    [template.id],
  );

  return (
    <div className="mkt-preview" aria-hidden="true">
      <div className="mkt-preview-sheet">
        <Resume
          data={SAMPLE_RESUME}
          templateId={template.id}
          paletteId={settings.paletteId}
          fontId={settings.fontId}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default MarketingPreview;
