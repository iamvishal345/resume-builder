import { clamp, contrastInk } from "@features/resume/style";
import { PDF_FONTS } from "./fonts";
import { round } from "./pdf-utils";

// Runtime token model mirroring buildResumeStyle (style.js) so the PDF matches
// the on-screen preview: same colors, rhythm and density scale.
export const pdfTokens = ({ palette, font, settings }) => {
  const density = settings.density === "dense";
  const s = density ? 0.88 : 1;
  const fontSize = round(clamp(settings.fontSize, 11, 18) * s);
  const sectionSpacing = round(clamp(settings.sectionSpacing, 8, 28) * s);
  const lineHeight = clamp(settings.lineHeight, 1.15, 1.9);
  const accent = settings.primaryColor || palette.accent;
  const bg = settings.bgColor || "#ffffff";
  const rawInk = settings.textColor || palette.ink;
  const ink =
    contrastInk(rawInk) === contrastInk(bg) ? contrastInk(bg) : rawInk;
  return {
    accent,
    accentSoft: palette.accentSoft,
    accentInk: contrastInk(accent, "#FFFFFF", "#111827"),
    ink,
    muted: palette.muted,
    rule: palette.rule,
    surface: palette.surface,
    bg,
    fontFamily: PDF_FONTS[font.id] || PDF_FONTS.sans,
    fontSize,
    lineHeight,
    sectionSpacing,
    entryGap: round(sectionSpacing * 0.72),
    headingGap: round(sectionSpacing * 0.45),
    richGap: round(sectionSpacing * 0.28),
    padX: round(26 * s),
    padY: round(30 * s),
    colGap: round(24 * s),
    nameSize: round(27 * s),
  };
};
