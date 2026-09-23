import React from "react";
import { getPalette } from "./palettes";
import { getFont } from "./fonts";
import { RESUME_LAYOUTS, BuildSections } from "./layouts";
import { resolveTemplate } from "./templates";
import {
  buildResumeStyle,
  buildSectionStyle,
  resolveLayoutSettings,
} from "./style";
import { availableSections, effectiveOrder } from "./order";
import { useResumeCanvas } from "./canvas";
import "./resume-fonts.css";
import "./resume.css";

export const Resume = ({
  data,
  templateId,
  paletteId,
  fontId,
  settings,
  interactive,
  onEditSection,
}) => {
  const template = resolveTemplate(templateId);
  const palette = getPalette(paletteId ?? template.palette);
  const font = getFont(fontId ?? template.font);
  const cfg = resolveLayoutSettings(settings, template);
  const layoutId = cfg.layoutId || "single";
  const meta = RESUME_LAYOUTS[layoutId] ?? RESUME_LAYOUTS.single;
  const Layout = meta.render;
  const vars = buildResumeStyle({ palette, font, settings: cfg });

  const sectionVars = {};
  const knownIds = availableSections(data).map((entry) => entry.id);
  for (const id of ["header", ...knownIds]) {
    const secStyle = buildSectionStyle({ settings: cfg, sectionId: id });
    if (secStyle) sectionVars[id] = secStyle;
  }

  const sections = BuildSections({
    data,
    styles: {
      skillStyle: cfg.skillStyle,
      languageStyle: cfg.languageStyle,
      experienceStyle: cfg.experienceStyle,
    },
    sectionVars,
  });
  const order = effectiveOrder(
    settings?.sectionOrder ?? cfg.sectionOrder,
    sections.map((entry) => entry.id),
    data
  );
  const canvas = useResumeCanvas({
    interactive,
    columnsOf: meta.columnsOf,
    order,
    sections,
    onEditSection,
  });

  // Feed the layout the columns the canvas currently renders (persisted
  // sectionCols, plus any transient override during a drag) so cross-column
  // drags show live and the final DOM order matches the PDF export.
  const domCfg = {
    ...cfg,
    ...(sectionVars.header ? { sectionVars } : {}),
    sectionCols: canvas.displayCols,
  };

  const paper = (
    <Layout
      data={data}
      vars={vars}
      cfg={domCfg}
      sections={sections}
      order={canvas.interactive ? canvas.displayOrder : order}
      canvas={canvas}
    />
  );

  if (!canvas.interactive) return paper;

  return (
    <div
      className="rcs-canvas-outer"
      onPointerDownCapture={(event) => {
        if (event.target.closest && event.target.closest("[data-rsection]")) return;
        canvas.deselect();
      }}
    >
      {paper}
    </div>
  );
};

export default Resume;