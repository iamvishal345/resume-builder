import React from "react";
import { getPalette } from "./palettes";
import { getFont } from "./fonts";
import { RESUME_LAYOUTS, BuildSections } from "./layouts";
import { resolveTemplate } from "./templates";
import { buildResumeStyle, RESUME_STYLE_DEFAULTS } from "./style";
import { effectiveOrder } from "./order";
import { useResumeCanvas } from "./canvas";
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
  const merged = { ...RESUME_STYLE_DEFAULTS, ...settings };
  const layoutId = settings?.layoutId || template.layout;
  const meta = RESUME_LAYOUTS[layoutId] ?? RESUME_LAYOUTS.single;
  const Layout = meta.render;
  const vars = buildResumeStyle({ palette, font, settings: merged });
  const cfg = {
    headerStyle: merged.headerStyle,
    density: merged.density,
  };

  const sections = BuildSections({ data });
  const order = effectiveOrder(
    settings?.sectionOrder,
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

  const paper = (
    <Layout
      data={data}
      vars={vars}
      cfg={cfg}
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