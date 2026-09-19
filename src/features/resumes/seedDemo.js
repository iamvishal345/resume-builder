import { DEFAULT_RESUME_SETTINGS } from "@store";
import { FULL_SAMPLE_STORE } from "@features/resume/sample";
import {
  RESUME_TEMPLATES,
  settingsFromTemplate,
} from "@features/resume/templates";
import {
  LAYOUT_OPTIONS,
  HEADER_ALIGNS,
  HEADER_STYLES,
  SKILL_STYLES,
  LANGUAGE_STYLES,
  EXPERIENCE_STYLES,
} from "@features/resume/style";
import { listResumes, putResume, deleteResume } from "@features/resumes/db";

const DEMO_PREFIX = "demo-";

const makeDoc = (id, name, settingsPatch, createdOffsetMs = 0) => {
  const now = Date.now() - createdOffsetMs;
  const base = FULL_SAMPLE_STORE();
  return {
    id: `${DEMO_PREFIX}${id}`,
    name,
    createdAt: now,
    updatedAt: now,
    data: {
      ...base,
      resumeSettings: {
        ...DEFAULT_RESUME_SETTINGS,
        ...settingsPatch,
      },
    },
  };
};

/** One document per catalog template. */
const templateDocs = () =>
  RESUME_TEMPLATES.map((template, index) => {
    const preset = settingsFromTemplate(template);
    return makeDoc(
      `tpl-${template.id}`,
      `${template.name} · ${template.category}`,
      preset,
      index * 1000,
    );
  });

/**
 * Extra variant demos so every structure / header / skill / language /
 * experience knob has at least one dedicated sample beyond the catalog.
 */
const variantDocs = () => {
  const docs = [];
  let i = 0;
  const push = (id, name, patch) => {
    docs.push(makeDoc(`var-${id}`, name, patch, 50_000 + i * 1000));
    i += 1;
  };

  for (const layout of LAYOUT_OPTIONS) {
    push(`layout-${layout.id}`, `Variant · Layout · ${layout.name}`, {
      templateId: "atlas",
      paletteId: "slate",
      fontId: "sans",
      layoutId: layout.id,
      headerAlign: "left",
      headerStyle: "rule",
      skillStyle: "chips",
      languageStyle: "dots",
      experienceStyle: "standard",
      sidebarTone: "light",
    });
  }

  for (const align of HEADER_ALIGNS) {
    push(`align-${align.id}`, `Variant · Align · ${align.name}`, {
      templateId: "prime",
      paletteId: "navy",
      fontId: "sans",
      layoutId: "single",
      headerAlign: align.id,
      headerStyle: "rule",
      skillStyle: "chips",
      languageStyle: "chips",
      experienceStyle: "standard",
    });
  }

  for (const header of HEADER_STYLES) {
    push(`header-${header.id}`, `Variant · Header · ${header.name}`, {
      templateId: "pulse",
      paletteId: "terracotta",
      fontId: "sans",
      layoutId: "single",
      headerAlign: "center",
      headerStyle: header.id,
      skillStyle: "chips",
      languageStyle: "dots",
      experienceStyle: "standard",
    });
  }

  for (const skill of SKILL_STYLES) {
    push(`skills-${skill.id}`, `Variant · Skills · ${skill.name}`, {
      templateId: "atlas",
      paletteId: "indigo",
      fontId: "sans",
      layoutId: "single",
      headerAlign: "left",
      headerStyle: "plain",
      skillStyle: skill.id,
      languageStyle: "list",
      experienceStyle: "standard",
    });
  }

  for (const language of LANGUAGE_STYLES) {
    push(`lang-${language.id}`, `Variant · Languages · ${language.name}`, {
      templateId: "nova",
      paletteId: "teal",
      fontId: "grotesk",
      layoutId: "sidebar",
      headerAlign: "left",
      headerStyle: "rule",
      skillStyle: "dots",
      languageStyle: language.id,
      experienceStyle: "standard",
      sidebarTone: "light",
    });
  }

  for (const experience of EXPERIENCE_STYLES) {
    push(`exp-${experience.id}`, `Variant · Experience · ${experience.name}`, {
      templateId: "smith",
      paletteId: "olive",
      fontId: "elegant",
      layoutId: "single",
      headerAlign: "left",
      headerStyle: "plain",
      skillStyle: "list",
      languageStyle: "list",
      experienceStyle: experience.id,
    });
  }

  for (const tone of ["light", "dark", "accent"]) {
    push(`tone-${tone}`, `Variant · Sidebar tone · ${tone}`, {
      templateId: "metro",
      paletteId: "navy",
      fontId: "grotesk",
      layoutId: "sidebar",
      headerAlign: "left",
      headerStyle: "plain",
      skillStyle: "bars",
      languageStyle: "bars",
      experienceStyle: "standard",
      sidebarTone: tone,
    });
  }

  push("density-dense", "Variant · Density · Dense", {
    templateId: "lite",
    paletteId: "teal",
    fontId: "sans",
    layoutId: "single",
    headerAlign: "left",
    headerStyle: "plain",
    skillStyle: "list",
    languageStyle: "list",
    experienceStyle: "compact",
    density: "dense",
  });

  return docs;
};

export const buildDemoResumeDocs = () => [...templateDocs(), ...variantDocs()];

/**
 * Upsert every demo resume into IndexedDB. Stable ids mean reloads refresh
 * content instead of duplicating. Prefer `ensureDemoResumes` on dashboard
 * load so user edits aren't wiped every visit.
 */
export const seedDemoResumes = async () => {
  const docs = buildDemoResumeDocs();
  for (const doc of docs) {
    await putResume(doc);
  }
  return docs.length;
};

/** Seed demos only when none are present (idempotent dashboard load). */
export const ensureDemoResumes = async () => {
  const all = await listResumes();
  if (all.some((doc) => isDemoResumeId(doc.id))) return 0;
  return seedDemoResumes();
};

export const isDemoResumeId = (id) =>
  typeof id === "string" && id.startsWith(DEMO_PREFIX);

export const clearDemoResumes = async () => {
  const all = await listResumes();
  let removed = 0;
  for (const doc of all) {
    if (isDemoResumeId(doc.id)) {
      await deleteResume(doc.id);
      removed += 1;
    }
  }
  return removed;
};
