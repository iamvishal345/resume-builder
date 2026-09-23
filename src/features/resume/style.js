// Resume appearance model — compositional, Zety-style.
// A template is a named preset of structure + header + skill/language/experience
// display options + palette/font. Users can override any knob in Customize.
//
// All pixel metrics are derived in computeMetrics() from a small set of global
// knobs (fontSize, lineHeight, sectionSpacing, pagePadding, …). Screen CSS
// (buildResumeStyle → --r-* vars) and PDF export (pdfTokens) share the same
// numeric model so preview and export cannot drift, and section-level
// overrides (settings.sectionStyles) recompute the scale per section.

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

/** Quick-select presets for sidebar column width (% of page). */
export const SIDEBAR_WIDTH_PRESETS = [
  { id: "narrow", name: "Narrow", value: 24 },
  { id: "default", name: "Default", value: 32 },
  { id: "wide", name: "Wide", value: 40 },
];

/** Quick-select presets for space between sidebar and main (px). */
export const SIDEBAR_GAP_PRESETS = [
  { id: "none", name: "None", value: 0 },
  { id: "tight", name: "Tight", value: 8 },
  { id: "default", name: "Default", value: 24 },
  { id: "roomy", name: "Roomy", value: 36 },
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
  // Global structure/typography knobs — exposed as Customize ranges.
  pagePadX: 26,
  pagePadY: 30,
  colGap: 24,
  nameSize: 27,
  photoSize: 72,
  radiusSm: 4,
  sidebarWidth: 32,
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
  // User-placed column preferences for 2-column layouts (resumeSettings).
  // Map of sectionId → column ARRAY index (0 = sidebar/aside | first column,
  // 1 = main | second column). Written by cross-column drag in the editor so a
  // manually moved section persists and prints identically in the PDF export.
  sectionCols: {},
  // Per-section overrides:
  // { [sectionId]: { fontSize?, lineHeight?, gap?, headingScale?,
  //                  marginTop?, marginBottom? } }
  // sectionId ∈ header | summary | experience | education | skills | extra:<n>
  sectionStyles: {},
};

// Ratios used to derive the type scale from a section's font size.
export const TYPE_RATIOS = {
  nameLineHeight: 1.15,
  nameLetterSpacing: 0.01,
  title: 0.95, // job title under the name
  contact: 0.88, // contact line
  contactSep: 0.75, // contact separator dot
  heading: 0.86, // section heading
  headingLetterSpacing: 0.08,
  entryTitle: 1, // entry title
  entryOrg: 0.94, // company / school under entry title
  meta: 0.88, // entry meta (dates, location) — also dates & certification meta
  compactTitle: 0.96, // compact experience entry title
  skill: 0.9, // chips + interest chips (normalized: was 0.9/skill, 0.92/interest)
  skillName: 0.92, // dots/bars skill names
  referenceMeta: 0.88, // references meta/contact (normalized: was 0.92em)
  certMeta: 0.88,
  chipPadY: 0.15,
  chipPadX: 0.55,
};

// Global defaults for the structural metric knobs (density scaled).
const STRUCTURE_DEFAULTS = {
  pagePadX: 26,
  pagePadY: 30,
  colGap: 24,
  nameSize: 27,
  photoSize: 72,
  radiusSm: 4,
  sidebarWidth: 32,
};

const DENSITY_DENSE = 0.88;

const round2 = (v) => Math.round(v * 100) / 100;

/**
 * Numeric metrics shared by the screen renderer and the PDF export. `overrides`
 * optionally carry per-section values ({ fontSize?, lineHeight?, gap?, headingScale? })
 * which recompute the whole scale for that section while global structure
 * (page padding, column gap, name size, …) stays untouched.
 */
export const computeMetrics = (settings = {}, overrides = {}) => {
  const dense = settings.density === "dense";
  const s = dense ? DENSITY_DENSE : 1;
  const globalFont = clamp(
    settings.fontSize ?? RESUME_STYLE_DEFAULTS.fontSize,
    11,
    18,
  );
  const globalSpacing = clamp(
    settings.sectionSpacing ?? RESUME_STYLE_DEFAULTS.sectionSpacing,
    8,
    28,
  );
  const globalLine = clamp(
    settings.lineHeight ?? RESUME_STYLE_DEFAULTS.lineHeight,
    1.15,
    1.9,
  );

  const fontSize = Math.round(
    (overrides.fontSize != null ? clamp(overrides.fontSize, 11, 18) : globalFont) * s
  );
  const sectionSpacing = Math.round(
    (overrides.gap != null ? clamp(overrides.gap, 0, 28) : globalSpacing) * s
  );
  const marginTop =
    overrides.marginTop != null
      ? Math.round(clamp(overrides.marginTop, 0, 48) * s)
      : undefined;
  const marginBottom =
    overrides.marginBottom != null
      ? Math.round(clamp(overrides.marginBottom, 0, 48) * s)
      : undefined;
  const lineHeight =
    overrides.lineHeight != null
      ? clamp(overrides.lineHeight, 1.1, 2)
      : globalLine;
  const headingScale =
    overrides.headingScale != null ? clamp(overrides.headingScale, 0.6, 1.5) : 1;

  const entryGap = Math.round(sectionSpacing * 0.72);
  const headingGap = Math.round(sectionSpacing * 0.45);
  const richGap = Math.round(sectionSpacing * 0.28);

  const padX =
    (settings.pagePadX != null ? settings.pagePadX : STRUCTURE_DEFAULTS.pagePadX) * s;
  const padY =
    (settings.pagePadY != null ? settings.pagePadY : STRUCTURE_DEFAULTS.pagePadY) * s;
  const colGap =
    (settings.colGap != null ? settings.colGap : STRUCTURE_DEFAULTS.colGap) * s;
  const nameSize = Math.round(
    (settings.nameSize != null ? settings.nameSize : STRUCTURE_DEFAULTS.nameSize) * s
  );
  const photoSize =
    (settings.photoSize != null ? settings.photoSize : STRUCTURE_DEFAULTS.photoSize) * s;
  const radiusSm =
    settings.radiusSm != null ? settings.radiusSm : STRUCTURE_DEFAULTS.radiusSm;
  const sidebarWidth = clamp(
    settings.sidebarWidth != null ? settings.sidebarWidth : STRUCTURE_DEFAULTS.sidebarWidth,
    18,
    48
  );

  const r = TYPE_RATIOS;
  const sizeOf = (ratio, scale = 1) => round2(fontSize * ratio * (scale === "heading" ? headingScale : 1));

  return {
    s,
    // core
    fontSize,
    lineHeight,
    sectionSpacing,
    marginTop,
    marginBottom,
    entryGap,
    headingGap,
    richGap,
    // structure
    padX,
    padY,
    colGap,
    nameSize,
    nameLineHeight: r.nameLineHeight,
    nameLetterSpacing: round2(fontSize * r.nameLetterSpacing),
    photoSize,
    radiusSm,
    sidebarWidth,
    // type scale
    headingSize:
      overrides.headingScale != null
        ? round2(fontSize * r.heading * headingScale)
        : round2(fontSize * r.heading),
    titleSize: sizeOf(r.title),
    contactSize: sizeOf(r.contact),
    contactSepSize: sizeOf(r.contactSep),
    entryTitleSize: sizeOf(r.entryTitle),
    entryOrgSize: sizeOf(r.entryOrg),
    metaSize: sizeOf(r.meta),
    compactTitleSize: sizeOf(r.compactTitle),
    skillSize: sizeOf(r.skill),
    skillNameSize: sizeOf(r.skillName),
    referenceMetaSize: sizeOf(r.referenceMeta),
    certMetaSize: sizeOf(r.certMeta),
    headingLetterSpacing: round2(fontSize * r.headingLetterSpacing),
    // header rhythm
    titleMarginTop: round2(fontSize * 0.15),
    titleMarginBottom: round2(fontSize * 0.4),
    contactGapCol: round2(fontSize * 0.55),
    contactGapRow: round2(fontSize * 0.25),
    headerPad: round2(sectionSpacing * 0.45),
    accentBarInset: round2(colGap * 0.55),
    headerPhotoGap: round2(fontSize),
    // rules & borders
    sectionRuleWidth: 1,
    headerRuleWidth: 2,
    headerDoubleWidth: 3,
    accentBarWidth: 4,
    timelineRailWidth: 2,
    photoBorder: 2,
    // skill rhythm
    skillRowGap: round2(fontSize * 0.75),
    skillStackGap: round2(fontSize * 0.4),
    skillListGap: round2(fontSize * 0.25),
    skillInlineGap: round2(fontSize * 0.35),
    chipRowGap: round2(fontSize * 0.35),
    chipColGap: round2(fontSize * 0.45),
    chipPadY: round2(fontSize * r.chipPadY),
    chipPadX: round2(fontSize * r.chipPadX),
    interestRowGap: round2(fontSize * 0.35),
    interestColGap: round2(fontSize * 0.55),
    levelDotSize: round2(fontSize * 0.55),
    levelDotGap: round2(fontSize * 0.22),
    levelBarHeight: round2(fontSize * 0.45),
    levelBarWidth: 42,
    levelBarMax: round2(fontSize * 7.5),
    // timeline
    timelineRailMin: round2(fontSize * 5.5),
    timelineRailTopPad: round2(fontSize * 0.15),
    timelineContentInset: round2(colGap * 0.65),
    // sidebar
    sidebarPadY: round2(padY * 0.75),
    sidebarPadX: round2(padX * 0.7),
    sidebarBleedPadY: padY,
    sidebarBleedPadX: round2(padX * 0.85),
    // extras & entries
    extrasGap: round2(entryGap * 0.85),
    compactHeaderGap: round2(fontSize * 0.1),
    compactRichMargin: round2(fontSize * 0.15),
    referenceMarginTop: round2(fontSize * 0.15),
    certMarginTop: round2(fontSize * 0.15),
    certUrlMarginTop: round2(fontSize * 0.2),
    metaStackGap: round2(fontSize * 0.1),
    subtitleGap: round2(fontSize * 0.2),
    listIndent: round2(fontSize * 1.15),
    indentPad: round2(fontSize * 1.3),
    // dark sidebar contact rules
    darkContactPadY: round2(fontSize * 0.5),
    darkContactMarginY: round2(fontSize * 0.55),
  };
};

// CSS-safe value pairs so buildResumeStyle only emits what CSS actually reads.
const CSS_METRICS = [
  ["--r-font-size", "fontSize", "px"],
  ["--r-line-height", "lineHeight", "num"],
  ["--r-name-line-height", "nameLineHeight", "num"],
  ["--r-section-gap", "sectionSpacing", "px"],
  ["--r-entry-gap", "entryGap", "px"],
  ["--r-heading-gap", "headingGap", "px"],
  ["--r-rich-gap", "richGap", "px"],
  ["--r-pad-x", "padX", "px"],
  ["--r-pad-y", "padY", "px"],
  ["--r-col-gap", "colGap", "px"],
  ["--r-name-size", "nameSize", "px"],
  ["--r-name-letter-spacing", "nameLetterSpacing", "px"],
  ["--r-photo-size", "photoSize", "px"],
  ["--r-radius-sm", "radiusSm", "px"],
  ["--r-sidebar-width", "sidebarWidth", "pct"],
  ["--r-heading-size", "headingSize", "px"],
  ["--r-title-size", "titleSize", "px"],
  ["--r-contact-size", "contactSize", "px"],
  ["--r-contact-sep-size", "contactSepSize", "px"],
  ["--r-entry-title-size", "entryTitleSize", "px"],
  ["--r-entry-org-size", "entryOrgSize", "px"],
  ["--r-meta-size", "metaSize", "px"],
  ["--r-compact-title-size", "compactTitleSize", "px"],
  ["--r-skill-size", "skillSize", "px"],
  ["--r-skill-name-size", "skillNameSize", "px"],
  ["--r-reference-meta-size", "referenceMetaSize", "px"],
  ["--r-cert-meta-size", "certMetaSize", "px"],
  ["--r-heading-letter-spacing", "headingLetterSpacing", "px"],
  ["--r-title-margin-top", "titleMarginTop", "px"],
  ["--r-title-margin-bottom", "titleMarginBottom", "px"],
  ["--r-contact-gap-x", "contactGapCol", "px"],
  ["--r-contact-gap-y", "contactGapRow", "px"],
  ["--r-header-pad", "headerPad", "px"],
  ["--r-accent-bar-inset", "accentBarInset", "px"],
  ["--r-header-photo-gap", "headerPhotoGap", "px"],
  ["--r-section-rule-width", "sectionRuleWidth", "px"],
  ["--r-header-rule-width", "headerRuleWidth", "px"],
  ["--r-header-double-width", "headerDoubleWidth", "px"],
  ["--r-accent-bar-width", "accentBarWidth", "px"],
  ["--r-timeline-rail-width", "timelineRailWidth", "px"],
  ["--r-photo-border", "photoBorder", "px"],
  ["--r-skill-row-gap", "skillRowGap", "px"],
  ["--r-skill-stack-gap", "skillStackGap", "px"],
  ["--r-skill-list-gap", "skillListGap", "px"],
  ["--r-skill-inline-gap", "skillInlineGap", "px"],
  ["--r-chip-row-gap", "chipRowGap", "px"],
  ["--r-chip-col-gap", "chipColGap", "px"],
  ["--r-chip-pad-y", "chipPadY", "px"],
  ["--r-chip-pad-x", "chipPadX", "px"],
  ["--r-interest-row-gap", "interestRowGap", "px"],
  ["--r-interest-col-gap", "interestColGap", "px"],
  ["--r-level-dot-size", "levelDotSize", "px"],
  ["--r-level-dot-gap", "levelDotGap", "px"],
  ["--r-level-bar-height", "levelBarHeight", "px"],
  ["--r-level-bar-width", "levelBarWidth", "pct"],
  ["--r-level-bar-max", "levelBarMax", "px"],
  ["--r-timeline-rail-min", "timelineRailMin", "px"],
  ["--r-timeline-rail-top-pad", "timelineRailTopPad", "px"],
  ["--r-timeline-content-inset", "timelineContentInset", "px"],
  ["--r-sidebar-pad-y", "sidebarPadY", "px"],
  ["--r-sidebar-pad-x", "sidebarPadX", "px"],
  ["--r-sidebar-bleed-pad-y", "sidebarBleedPadY", "px"],
  ["--r-sidebar-bleed-pad-x", "sidebarBleedPadX", "px"],
  ["--r-extras-gap", "extrasGap", "px"],
  ["--r-compact-header-gap", "compactHeaderGap", "px"],
  ["--r-compact-rich-margin", "compactRichMargin", "px"],
  ["--r-reference-margin-top", "referenceMarginTop", "px"],
  ["--r-cert-margin-top", "certMarginTop", "px"],
  ["--r-cert-url-margin-top", "certUrlMarginTop", "px"],
  ["--r-meta-stack-gap", "metaStackGap", "px"],
  ["--r-subtitle-gap", "subtitleGap", "px"],
  ["--r-list-indent", "listIndent", "px"],
  ["--r-indent-pad", "indentPad", "px"],
  ["--r-dark-contact-pad-y", "darkContactPadY", "px"],
  ["--r-dark-contact-margin-y", "darkContactMarginY", "px"],
];

const cssValue = (m, key, unit) => {
  const v = m[key];
  if (unit === "px") return `${v}px`;
  if (unit === "pct") return `${v}%`;
  return String(v);
};

export const buildResumeStyle = ({ palette, font, settings = {} }) => {
  const m = computeMetrics(settings);
  const accent = settings.primaryColor || palette.accent;
  const bg = settings.bgColor || "#ffffff";
  const rawInk = settings.textColor || palette.ink;
  const ink =
    contrastInk(rawInk) === contrastInk(bg) ? contrastInk(bg) : rawInk;

  const vars = {
    "--r-accent": accent,
    "--r-accent-soft": palette.accentSoft,
    "--r-accent-ink": contrastInk(accent, "#FFFFFF", "#111827"),
    "--r-ink": ink,
    "--r-muted": palette.muted,
    "--r-rule": palette.rule,
    "--r-contact-sep": mixHex(palette.muted, palette.rule, 0.5),
    "--r-border": palette.rule,
    "--r-surface": palette.surface,
    "--r-bg": bg,
    "--r-font": font.stack,
  };
  for (const [css, key, unit] of CSS_METRICS) {
    vars[css] = cssValue(m, key, unit);
  }
  return vars;
};

/**
 * CSS variable map for a single section when the user has per-section
 * overrides (settings.sectionStyles[sectionId]). Returns undefined when the
 * section is untouched so the base paper tokens keep applying.
 */
export const buildSectionStyle = ({ settings, sectionId }) => {
  const ov = settings?.sectionStyles?.[sectionId] || null;
  if (!ov) return undefined;
  const m = computeMetrics(settings, ov);
  const vars = {};
  // Every metric that is derived from the section's own font size / spacing
  // must be re-emitted so descendants read the section's scale.
  const includes = new Set([
    "--r-font-size",
    "--r-line-height",
    "--r-section-gap",
    "--r-entry-gap",
    "--r-heading-gap",
    "--r-rich-gap",
    "--r-heading-size",
    "--r-title-size",
    "--r-contact-size",
    "--r-contact-sep-size",
    "--r-entry-title-size",
    "--r-entry-org-size",
    "--r-meta-size",
    "--r-compact-title-size",
    "--r-skill-size",
    "--r-skill-name-size",
    "--r-reference-meta-size",
    "--r-cert-meta-size",
    "--r-heading-letter-spacing",
    "--r-title-margin-top",
    "--r-title-margin-bottom",
    "--r-contact-gap-x",
    "--r-contact-gap-y",
    "--r-header-pad",
    "--r-skill-row-gap",
    "--r-skill-stack-gap",
    "--r-skill-list-gap",
    "--r-skill-inline-gap",
    "--r-chip-row-gap",
    "--r-chip-col-gap",
    "--r-chip-pad-y",
    "--r-chip-pad-x",
    "--r-interest-row-gap",
    "--r-interest-col-gap",
    "--r-level-dot-size",
    "--r-level-dot-gap",
    "--r-level-bar-height",
    "--r-level-bar-max",
    "--r-timeline-rail-min",
    "--r-timeline-rail-top-pad",
    "--r-timeline-content-inset",
    "--r-extras-gap",
    "--r-compact-header-gap",
    "--r-compact-rich-margin",
    "--r-reference-margin-top",
    "--r-cert-margin-top",
    "--r-cert-url-margin-top",
    "--r-meta-stack-gap",
    "--r-subtitle-gap",
    "--r-list-indent",
    "--r-indent-pad",
  ]);
  for (const [css, key, unit] of CSS_METRICS) {
    if (includes.has(css)) vars[css] = cssValue(m, key, unit);
  }
  // Per-section margin (extra spacing before/after the section). Emitted only
  // when the user overrides them; otherwise the paper-level fallbacks apply.
  if (m.marginTop != null) vars["--r-section-margin-top"] = `${m.marginTop}px`;
  if (m.marginBottom != null)
    vars["--r-section-margin-bottom"] = `${m.marginBottom}px`;
  return vars;
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

/** Resolve layoutId, including legacy saved ids. */
export const resolveLayoutId = (settings) => {
  const raw = settings?.layoutId || "single";
  if (LAYOUT_OPTIONS.some((o) => o.id === raw)) return raw;
  return LEGACY_LAYOUT_MAP[raw]?.layoutId || "single";
};

export const isSidebarLayout = (settings) => {
  const id = resolveLayoutId(settings);
  return id === "sidebar" || id === "sidebar-right";
};

export const isSplitLayout = (settings) => resolveLayoutId(settings) === "split";

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

/** Mix two hex colors in sRGB (a when t=0, b when t=1). Returns #rrggbb. */
export const mixHex = (a, b, t = 0.5) => {
  const p = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  if (!/^#[0-9a-fA-F]{6}$/.test(a) || !/^#[0-9a-fA-F]{6}$/.test(b)) return a;
  const c = (x, y) => Math.round(x * (1 - t) + y * t);
  const [ar, ag, ab] = p(a);
  const [br, bg, bb] = p(b);
  const hx = (n) => n.toString(16).padStart(2, "0");
  return `#${hx(c(ar, br))}${hx(c(ag, bg))}${hx(c(ab, bb))}`;
};

/** Pick black or white ink for readable text on a hex background. */
export const contrastInk = (hex, light = "#FFFFFF", dark = "#111827") => {
  const raw = hex && typeof hex === "string" ? hex.trim().replace("#", "") : "";
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