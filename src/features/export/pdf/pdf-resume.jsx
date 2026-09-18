import React from "react";
import { Document } from "@react-pdf/renderer";
import { getPalette } from "@features/resume/palettes";
import { getFont } from "@features/resume/fonts";
import { resolveTemplate } from "@features/resume/templates";
import { resolveLayoutSettings } from "@features/resume/style";
import { availableSections, effectiveOrder } from "@features/resume/order";
import { registerPdfFonts } from "./fonts";
import { SITE } from "@data/site";
import { pdfTokens } from "./pdf-tokens";
import { PDF_LAYOUTS } from "./pdf-layouts";

export {
  htmlLines,
  formatDate,
  rangeText,
  pdfContactParts,
} from "./pdf-utils";

registerPdfFonts();

export const PdfResume = ({
  data,
  templateId,
  paletteId,
  fontId,
  settings,
}) => {
  const template = resolveTemplate(templateId);
  const palette = getPalette(paletteId ?? template.palette);
  const font = getFont(fontId ?? template.font);
  const cfg = resolveLayoutSettings(settings, template);
  const t = pdfTokens({ palette, font, settings: cfg });
  const layoutId = cfg.layoutId || "single";
  const Layout = PDF_LAYOUTS[layoutId] || PDF_LAYOUTS.single;
  const available = availableSections(data);
  const ids = effectiveOrder(
    settings?.sectionOrder ?? cfg.sectionOrder,
    available.map((entry) => entry.id),
    data,
  );
  const info = {
    author:
      [data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
      "Resume",
    title: "Resume",
  };
  return (
    <Document
      author={info.author}
      creator={SITE.name}
      producer={SITE.name}
      title={info.title}
      subject={info.title}
    >
      <Layout data={data} ids={ids} t={t} config={cfg} />
    </Document>
  );
};

export default PdfResume;
