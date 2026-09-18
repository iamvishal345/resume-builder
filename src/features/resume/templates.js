import {
  RESUME_STYLE_DEFAULTS,
  resolveLayoutSettings,
} from "./style";

export const RESUME_CATEGORIES = [
  { id: "simple", name: "Simple" },
  { id: "modern", name: "Modern" },
  { id: "professional", name: "Professional" },
  { id: "creative", name: "Creative" },
  { id: "elegant", name: "Elegant" },
];

const T = (id, name, category, palette, font, style) => ({
  id,
  name,
  category,
  palette,
  font,
  // kept for resolveLayoutSettings / older callers
  layout: style.layoutId,
  style: { ...RESUME_STYLE_DEFAULTS, ...style },
});

/**
 * Curated Zety-inspired catalog. Each preset is a distinct combination of
 * structure, header treatment, and skill/language/experience rendering —
 * not just a palette swap.
 */
export const RESUME_TEMPLATES = [
  // —— Simple (ATS-friendly, single column) ——
  T("clean", "Clean", "simple", "slate", "sans", {
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "comma",
    languageStyle: "list",
    experienceStyle: "standard",
  }),
  T("prime", "Prime", "simple", "navy", "sans", {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "rule",
    skillStyle: "chips",
    languageStyle: "chips",
    experienceStyle: "standard",
  }),
  T("lite", "Lite", "simple", "teal", "sans", {
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "list",
    languageStyle: "list",
    experienceStyle: "compact",
  }),
  T("folio", "Folio", "simple", "olive", "serif", {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "double",
    skillStyle: "comma",
    languageStyle: "dots",
    experienceStyle: "standard",
  }),
  T("cubic", "Cubic", "simple", "indigo", "grotesk", {
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "accent",
    skillStyle: "columns",
    languageStyle: "list",
    experienceStyle: "standard",
  }),

  // —— Modern (sidebar / split, contemporary) ——
  T("cascade", "Cascade", "modern", "indigo", "sans", {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "bars",
    languageStyle: "bars",
    experienceStyle: "standard",
    sidebarTone: "light",
  }),
  T("nova", "Nova", "modern", "teal", "grotesk", {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "rule",
    skillStyle: "dots",
    languageStyle: "dots",
    experienceStyle: "standard",
    sidebarTone: "light",
  }),
  T("orbit", "Orbit", "modern", "slate", "sans", {
    layoutId: "sidebar-right",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "chips",
    languageStyle: "chips",
    experienceStyle: "standard",
    sidebarTone: "light",
  }),
  T("pulse", "Pulse", "modern", "terracotta", "sans", {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "band",
    skillStyle: "chips",
    languageStyle: "dots",
    experienceStyle: "standard",
  }),
  T("signal", "Signal", "modern", "emerald", "grotesk", {
    layoutId: "split",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "bars",
    languageStyle: "bars",
    experienceStyle: "standard",
  }),
  T("vertex", "Vertex", "modern", "navy", "grotesk", {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "band",
    skillStyle: "dots",
    languageStyle: "list",
    experienceStyle: "timeline",
    sidebarTone: "accent",
  }),

  // —— Professional (recruiter-safe) ——
  T("atlas", "Atlas", "professional", "slate", "sans", {
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "rule",
    skillStyle: "chips",
    languageStyle: "dots",
    experienceStyle: "standard",
  }),
  T("carter", "Carter", "professional", "navy", "sans", {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "list",
    languageStyle: "list",
    experienceStyle: "standard",
    sidebarTone: "light",
  }),
  T("hayes", "Hayes", "professional", "indigo", "sans", {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "rule",
    skillStyle: "dots",
    languageStyle: "dots",
    experienceStyle: "standard",
    sidebarTone: "light",
  }),
  T("grant", "Grant", "professional", "olive", "elegant", {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "double",
    skillStyle: "comma",
    languageStyle: "list",
    experienceStyle: "standard",
  }),
  T("nolan", "Nolan", "professional", "slate", "sans", {
    layoutId: "split",
    headerAlign: "left",
    headerStyle: "rule",
    skillStyle: "columns",
    languageStyle: "dots",
    experienceStyle: "compact",
  }),
  T("smith", "Smith", "professional", "teal", "elegant", {
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "list",
    languageStyle: "list",
    experienceStyle: "timeline",
  }),

  // —— Creative (bold visual identity) ——
  T("metro", "Metro", "creative", "navy", "grotesk", {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "bars",
    languageStyle: "bars",
    experienceStyle: "standard",
    sidebarTone: "dark",
  }),
  T("onyx", "Onyx", "creative", "slate", "slab", {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "band",
    skillStyle: "chips",
    languageStyle: "chips",
    experienceStyle: "standard",
    sidebarTone: "dark",
  }),
  T("torch", "Torch", "creative", "rose", "display", {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "band",
    skillStyle: "chips",
    languageStyle: "dots",
    experienceStyle: "standard",
  }),
  T("zenith", "Zenith", "creative", "emerald", "display", {
    layoutId: "split",
    headerAlign: "center",
    headerStyle: "band",
    skillStyle: "bars",
    languageStyle: "bars",
    experienceStyle: "standard",
  }),
  T("amp", "Amp", "creative", "terracotta", "grotesk", {
    layoutId: "sidebar-right",
    headerAlign: "left",
    headerStyle: "accent",
    skillStyle: "dots",
    languageStyle: "dots",
    experienceStyle: "timeline",
    sidebarTone: "accent",
  }),

  // —— Elegant (serif, refined) ——
  T("manor", "Manor", "elegant", "burgundy", "serif", {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "double",
    skillStyle: "comma",
    languageStyle: "list",
    experienceStyle: "standard",
  }),
  T("windsor", "Windsor", "elegant", "gold", "serif", {
    layoutId: "sidebar",
    headerAlign: "left",
    headerStyle: "rule",
    skillStyle: "list",
    languageStyle: "dots",
    experienceStyle: "standard",
    sidebarTone: "light",
  }),
  T("chateau", "Chateau", "elegant", "burgundy", "elegant", {
    layoutId: "sidebar",
    headerAlign: "center",
    headerStyle: "double",
    skillStyle: "dots",
    languageStyle: "dots",
    experienceStyle: "standard",
    sidebarTone: "light",
  }),
  T("regent", "Regent", "elegant", "navy", "serif", {
    layoutId: "single",
    headerAlign: "center",
    headerStyle: "rule",
    skillStyle: "comma",
    languageStyle: "list",
    experienceStyle: "compact",
  }),
  T("oriel", "Oriel", "elegant", "olive", "elegant", {
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "accent",
    skillStyle: "list",
    languageStyle: "bars",
    experienceStyle: "timeline",
  }),
];

export const resolveTemplate = (id) => {
  const found = RESUME_TEMPLATES.find((t) => t.id === id);
  if (found) return found;
  // Legacy ids from the old 86-template catalog → closest new preset.
  const LEGACY_ALIAS = {
    air: "clean",
    aspen: "lite",
    birch: "folio",
    canvas: "prime",
    dove: "folio",
    fog: "clean",
    linen: "folio",
    mist: "lite",
    oak: "clean",
    reed: "lite",
    aurora: "nova",
    beacon: "cascade",
    coda: "smith",
    drift: "signal",
    eclipse: "metro",
    glow: "signal",
    surge: "smith",
    wave: "signal",
    aero: "nova",
    cobalt: "zenith",
    steel: "signal",
    plaza: "nolan",
    crimson: "oriel",
    ascot: "regent",
    duke: "grant",
    empire: "carter",
    senator: "hayes",
    sovereign: "manor",
    sterling: "windsor",
    victorian: "manor",
    ambassador: "grant",
    governor: "grant",
    colonnade: "chateau",
    regency: "chateau",
    amped: "torch",
    ballistic: "torch",
    boldface: "zenith",
    cadence: "torch",
    chrome: "signal",
    entropy: "torch",
    overture: "zenith",
    stance: "pulse",
    vector: "signal",
    tempest: "amp",
    behemoth: "onyx",
    marquee: "vertex",
    reckoner: "lite",
    sentinel: "hayes",
    bailey: "atlas",
    dunn: "atlas",
    evans: "carter",
    kent: "grant",
    mason: "hayes",
    ravine: "smith",
    sable: "nova",
    hunter: "lite",
    lynx: "amp",
    canyon: "signal",
    parker: "nolan",
    walden: "pulse",
    harper: "oriel",
    fern: "pulse",
    meadow: "pulse",
  };
  const alias = LEGACY_ALIAS[id];
  return (
    RESUME_TEMPLATES.find((t) => t.id === alias) || RESUME_TEMPLATES[0]
  );
};

export const templatesByCategory = (categoryId) =>
  RESUME_TEMPLATES.filter((t) => t.category === categoryId);

/** Apply a template preset into resumeSettings (full style snapshot). */
export const settingsFromTemplate = (template) => {
  const resolved = resolveLayoutSettings({}, template);
  return {
    templateId: template.id,
    paletteId: template.palette,
    fontId: template.font,
    layoutId: resolved.layoutId,
    headerAlign: resolved.headerAlign,
    headerStyle: resolved.headerStyle,
    skillStyle: resolved.skillStyle,
    languageStyle: resolved.languageStyle,
    experienceStyle: resolved.experienceStyle,
    sidebarTone: resolved.sidebarTone,
    // Drop per-resume color overrides so a prior dark-sidebar white ink
    // cannot linger on a light template (white-on-white).
    primaryColor: "",
    bgColor: "",
    textColor: "",
  };
};
