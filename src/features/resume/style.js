export const RESUME_DENSITIES = [
  { id: "normal", name: "Normal" },
  { id: "dense", name: "Dense" },
];

export const RESUME_HEADER_STYLES = [
  { id: "normal", name: "Normal header" },
  { id: "color", name: "Color header" },
];

export const LAYOUT_OPTIONS = [
  { id: "single", name: "Single Column" },
  { id: "minimal", name: "Minimal" },
  { id: "sidebar", name: "Sidebar" },
  { id: "split", name: "Split" },
  { id: "topband", name: "Top Band" },
  { id: "modern", name: "Modern" },
  { id: "timeline", name: "Timeline" },
  { id: "darksidebar", name: "Dark Sidebar" },
  { id: "sidebarheader", name: "Sidebar Header" },
  { id: "phototop", name: "Photo Top" },
  { id: "elegant", name: "Elegant" },
  { id: "compact", name: "Compact" },
  { id: "branded", name: "Branded" },
  { id: "executive", name: "Executive" },
  { id: "minimalcolumns", name: "Minimal Columns" },
  { id: "clean", name: "Clean" },
  { id: "accentleft", name: "Accent Left" },
  { id: "timelinesplit", name: "Timeline Split" },
  { id: "modernsplit", name: "Modern Split" },
];

export const RESUME_STYLE_DEFAULTS = {
  fontSize: 14,
  lineHeight: 1.5,
  sectionSpacing: 16,
  headerStyle: "normal",
  density: "normal",
  primaryColor: "",
  bgColor: "",
  textColor: "",
};

export const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, typeof value === "number" ? value : min));

// Builds the CSS custom properties that drive every resume layout.
// Density scales the whole rhythm, and color overrides win over the palette.
export const buildResumeStyle = ({ palette, font, settings = {} }) => {
  const density = settings.density === "dense";
  const s = density ? 0.88 : 1;
  const fontSize = Math.round(clamp(settings.fontSize, 11, 18) * s);
  const sectionSpacing = Math.round(clamp(settings.sectionSpacing, 8, 28) * s);
  const lineHeight = clamp(settings.lineHeight, 1.15, 1.9);

  return {
    "--r-accent": settings.primaryColor || palette.accent,
    "--r-accent-soft": palette.accentSoft,
    "--r-accent-ink": palette.accentInk,
    "--r-ink": settings.textColor || palette.ink,
    "--r-muted": palette.muted,
    "--r-rule": palette.rule,
    "--r-surface": palette.surface,
    "--r-bg": settings.bgColor || "#ffffff",
    "--r-font": font.stack,
    "--r-font-size": `${fontSize}px`,
    "--r-line-height": lineHeight,
    "--r-section-gap": `${sectionSpacing}px`,
    "--r-entry-gap": `${Math.round(sectionSpacing * 0.72)}px`,
    "--r-heading-gap": `${Math.round(sectionSpacing * 0.45)}px`,
    "--r-rich-gap": `${Math.round(sectionSpacing * 0.28)}px`,
    "--r-pad-x": `${Math.round(26 * s)}px`,
    "--r-pad-y": `${Math.round(30 * s)}px`,
    "--r-col-gap": `${Math.round(24 * s)}px`,
    "--r-name-size": `${Math.round(27 * s)}px`,
  };
};