import { contrastInk, computeMetrics, mixHex } from "@features/resume/style";
import { PDF_FONTS } from "./fonts";
import { round } from "./pdf-utils";

// Runtime token model mirroring buildResumeStyle (style.js) so the PDF matches
// the on-screen preview: same colors, rhythm and density scale. The numeric
// metrics come straight from computeMetrics() — a single source with the DOM.
export const pdfTokens = ({ palette, font, settings }) => {
  const m = computeMetrics(settings);
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
    contactSep: mixHex(palette.muted, palette.rule, 0.5),
    surface: palette.surface,
    bg,
    fontFamily: PDF_FONTS[font.id] || PDF_FONTS.sans,
    // Integer-rounded values keep the PDF grid crisp (react-pdf renders points).
    ...Object.fromEntries(
      Object.entries(m).map(([key, value]) => [
        key,
        typeof value === "number" ? round(value) : value,
      ]),
    ),
  };
};

/**
 * Recompute the metric subset for one section from settings.sectionStyles[id].
 * Returns the same token object (colors untouched) when the section has no
 * override, so callers can always render against the returned `t`.
 */
export const withSection = (t, settings, override) => {
  if (!override) return t;
  const m = computeMetrics(settings, override);
  return {
    ...t,
    ...Object.fromEntries(
      Object.entries(m).map(([key, value]) => [
        key,
        typeof value === "number" ? round(value) : value,
      ]),
    ),
  };
};