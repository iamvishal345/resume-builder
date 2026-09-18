import { toSkillList } from "@features/resume/skillList";
import { extraSectionHasContent } from "@features/resume/extraContent";

// Canonical resume sections and ordering helpers.
// Section ids: "summary" | "experience" | "education" | "skills" | `extra:<n>`
// where <n> is the numeric id of an additional section (e.g. Languages = 5).
// Ordering is stored in resumeSettings.sectionOrder so the canvas reorder
// persists, survives reloads, and prints with the same layout.

export const BASE_SECTION_IDS = ["summary", "experience", "education", "skills"];

export const SECTION_TITLES = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
};

export const isExtra = (id) => typeof id === "string" && id.startsWith("extra:");

export const extraIdOf = (id) => Number(id.slice("extra:".length));

export const titleOf = (id, list) => {
  const found = list.find((entry) => entry.id === id);
  return found ? found.title : SECTION_TITLES[id] || id;
};

// Canonical order given the current content — new/last sections appended last.
export const defaultOrder = (data) => {
  const extras = (data?.additionalSections || data?.extras || []).map((section) =>
    section && section.id !== undefined ? `extra:${section.id}` : ""
  );
  return [...BASE_SECTION_IDS, ...extras.filter(Boolean)];
};

// The ordered list of sections that currently have content. This is the single
// source of truth for section gating shared by the DOM renderer and the PDF
// export (both must agree on what exists and in what canonical order).
export const availableSections = (data) => {
  const out = [];
  if (data.summary) out.push({ id: "summary", title: "Summary" });
  if (data.experience?.length) out.push({ id: "experience", title: "Experience" });
  if (data.education?.length) out.push({ id: "education", title: "Education" });
  const skillEntries = toSkillList(data.skills);
  if (skillEntries.some((s) => s.name)) out.push({ id: "skills", title: "Skills" });
  for (const section of data.extras || []) {
    if (!extraSectionHasContent(section)) continue;
    const id = `extra:${section.id}`;
    out.push({
      id,
      title:
        (section.title && String(section.title).trim()) ||
        (section.id === 5 ? "Languages" : "Additional"),
    });
  }
  return out;
};

// The stored order filtered to sections that still exist, with missing ones
// appended in canonical order.
export const effectiveOrder = (stored, available, data) => {
  const inUse = new Set(available);
  const result = (Array.isArray(stored) ? stored : [])
    .filter((id) => inUse.has(id))
    .filter((id, index, all) => all.indexOf(id) === index);
  for (const id of defaultOrder(data)) {
    if (inUse.has(id) && !result.includes(id)) result.push(id);
  }
  return result;
};

// Move `id` one step up/down inside its layout column and return the new flat
// order (the layout's column order then main order, i.e. final DOM order).
// `columns` is the array of id arrays a layout currently renders.
export const moveWithinColumn = (columns, id, dir) => {
  const stack = columns.find((col) => col.includes(id));
  if (!stack) return columns.flat();
  const pos = stack.indexOf(id);
  const target = dir === "up" ? pos - 1 : pos + 1;
  if (target < 0 || target >= stack.length) return columns.flat();
  const next = [...stack];
  [next[pos], next[target]] = [next[target], next[pos]];
  return columns.map((col) => (col === stack ? next : col)).flat();
};

// Reorder `movingId` relative to `targetId` (same column) and return the new
// flat order. By default the moving section lands immediately BEFORE the
// target; pass `after=true` to land immediately AFTER it. Used by drag & drop.
export const placeBefore = (columns, movingId, targetId, after = false) => {
  const stack = columns.find(
    (col) => col.includes(movingId) && col.includes(targetId)
  );
  if (!stack || movingId === targetId) return columns.flat();
  const next = stack.filter((id) => id !== movingId);
  const idx = next.indexOf(targetId);
  next.splice(after ? idx + 1 : idx, 0, movingId);
  return columns.map((col) => (col === stack ? next : col)).flat();
};