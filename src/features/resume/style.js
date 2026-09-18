// Resume appearance model — compositional, Zety-style.
// A template is a named preset of structure + header + skill/language/experience
// display options + palette/font. Users can override any knob in Customize.

export const RESUME_DENSITIES = [
  { id: "normal", name: "Normal" },
  { id: "dense", name: "Dense" },
];

/** Page structure — the primary layout axis. */
export const LAYOUT_OPTIONS = [
  { id: "single", name: "Single column" },
  { id: "sidebar", name: "Left sidebar" },
  { id: "sidebar-right", name: "Right sidebar" },
  { id: "split", name: "Two columns" },
];

export const HEADER_ALIGNS = [
  { id: "left", name: "Left" },
  { id: "center", name: "Center" },
];

export const HEADER_STYLES = [
  { id: "plain", name: "Plain" },
  { id: "rule", name: "Underline" },
  { id: "band", name: "Color band" },
  { id: "double", name: "Double rule" },
  { id: "accent", name: "Accent bar" },
];

export const SKILL_STYLES = [
  { id: "chips", name: "Chips" },
  { id: "dots", name: "Level dots" },
  { id: "bars", name: "Level bars" },
  { id: "list", name: "Bullet list" },
  { id: "comma", name: "Comma list" },
  { id: "columns", name: "Two columns" },
];

export const LANGUAGE_STYLES = [
  { id: "chips", name: "Chips" },
  { id: "dots", name: "Level dots" },
  { id: "bars", name: "Level bars" },
  { id: "list", name: "List" },
];

export const EXPERIENCE_STYLES = [
  { id: "standard", name: "Standard" },
  { id: "timeline", name: "Timeline" },
  { id: "compact", name: "Compact" },
];

/** Kept for older UI labels that said "Color header". */
export const RESUME_HEADER_STYLES = [
  { id: "plain", name: "Plain header" },
  { id: "band", name: "Color header" },
];

export const RESUME_STYLE_DEFAULTS = {
  fontSize: 14,
  lineHeight: 1.5,
  sectionSpacing: 16,
  layoutId: "single",
  headerAlign: "left",
  headerStyle: "plain",
  skillStyle: "chips",
  languageStyle: "dots",
  experienceStyle: "standard",
  density: "normal",
  sidebarTone: "light", // light | dark | accent
  showPhoto: true,
  docxLayout: "ats",
  letterTemplateId: "classic",
  primaryColor: "",
  bgColor: "",
  textColor: "",
  sectionOrder: [],
};

/**
 * Map legacy layout ids (pre-compositional rewrite) onto the new knobs so
 * saved resumes keep looking intentional instead of falling back to single.
 */
export const LEGACY_LAYOUT_MAP = {
  single: { layoutId: "single", headerAlign: "center", headerStyle: "plain" },
  minimal: { layoutId: "single", headerAlign: "left", headerStyle: "plain" },
  clean: { layoutId: "single", headerAlign: "left", headerStyle: "plain" },
  compact: {
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "rule",
    experienceStyle: "compact",
  },
  elegant: {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "double",
  },
  executive: {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "double",
  },
  accentleft: {
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "accent",
  },
  topband: { layoutId: "single", headerAlign: "center", headerStyle: "band" },
  phototop: { layoutId: "single", headerAlign: "left", headerStyle: "band" },
  timeline: {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "plain",
    experienceStyle: "timeline",
  },
  sidebar: { layoutId: "sidebar", headerAlign: "left", headerStyle: "plain" },
  modern: { layoutId: "sidebar", headerAlign: "left", headerStyle: "rule" },
  sidebarheader: {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "plain",
    sidebarTone: "light",
  },
  darksidebar: {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "plain",
    sidebarTone: "dark",
  },
  branded: {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "band",
    sidebarTone: "accent",
  },
  split: { layoutId: "split", headerAlign: "left", headerStyle: "plain" },
  modernsplit: {
    layoutId: "split",
    headerAlign: "center",
    headerStyle: "band",
  },
  minimalcolumns: {
    layoutId: "split",
    headerAlign: "center",
    headerStyle: "plain",
  },
  timelinesplit: {
    layoutId: "split",
    headerAlign: "left",
    headerStyle: "plain",
    experienceStyle: "timeline",
  },
};

export const resolveLayoutSettings = (settings = {}, template = {}) => {
  const rawLayout = settings.layoutId || template.layout || "single";
  const legacy = LEGACY_LAYOUT_MAP[rawLayout];
  const isNewLayout = LAYOUT_OPTIONS.some((o) => o.id === rawLayout);

  const base = {
    ...RESUME_STYLE_DEFAULTS,
    ...(template.style || {}),
    ...settings,
  };

  if (isNewLayout) {
    return {
      ...base,
      layoutId: rawLayout,
      headerAlign: settings.headerAlign || template.style?.headerAlign || base.headerAlign,
      headerStyle:
        // migrate old "color" / "normal" headerStyle values
        settings.headerStyle === "color"
          ? "band"
          : settings.headerStyle === "normal"
            ? "plain"
            : settings.headerStyle ||
              template.style?.headerStyle ||
              base.headerStyle,
    };
  }

  // Legacy layout id from an older template or saved settings.
  return {
    ...base,
    ...(legacy || { layoutId: "single" }),
    headerStyle:
      settings.headerStyle === "color"
        ? "band"
        : settings.headerStyle === "normal"
          ? legacy?.headerStyle || "plain"
          : settings.headerStyle || legacy?.headerStyle || base.headerStyle,
  };
};

export const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, typeof value === "number" ? value : min));

/** Pick black or white ink for readable text on a hex background. */
export const contrastInk = (hex, light = "#FFFFFF", dark = "#111827") => {
  if (!hex || typeof hex !== "string") return light;
  const raw = hex.trim().replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return light;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? dark : light;
};

export const buildResumeStyle = ({ palette, font, settings = {} }) => {
  const density = settings.density === "dense";
  const s = density ? 0.88 : 1;
  const fontSize = Math.round(clamp(settings.fontSize, 11, 18) * s);
  const sectionSpacing = Math.round(clamp(settings.sectionSpacing, 8, 28) * s);
  const lineHeight = clamp(settings.lineHeight, 1.15, 1.9);
  const accent = settings.primaryColor || palette.accent;
  const bg = settings.bgColor || "#ffffff";
  const rawInk = settings.textColor || palette.ink;
  // If custom text is nearly the same luminance as the page, fall back to a
  // contrasting ink (fixes white text left over on Atlas / light templates).
  const ink =
    contrastInk(rawInk) === contrastInk(bg) ? contrastInk(bg) : rawInk;

  return {
    "--r-accent": accent,
    "--r-accent-soft": palette.accentSoft,
    "--r-accent-ink": contrastInk(accent, "#FFFFFF", "#111827"),
    "--r-ink": ink,
    "--r-muted": palette.muted,
    "--r-rule": palette.rule,
    "--r-border": palette.rule,
    "--r-surface": palette.surface,
    "--r-bg": bg,
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
    "--r-radius-sm": "4px",
    "--r-sidebar-width": "32%",
  };
};
