import { toSkillList } from "@features/resume/skillList";
import { extraSectionHasContent } from "@features/resume/extraContent";

// Canonical resume sections and ordering helpers.
// Section ids: "summary" | "experience" | "education" | "skills" | `extra:<instanceId>`
// Catalog kind (1–7) lives on additionalSections[].kind (fallback: id when 1–7).

export const BASE_SECTION_IDS = ["summary", "experience", "education", "skills"];

export const SECTION_TITLES = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
};

export const isExtra = (id) => typeof id === "string" && id.startsWith("extra:");

export const extraIdOf = (id) => Number(String(id).slice("extra:".length));

/** Stable canvas / order id for an additional section instance. */
export const extraRefOf = (section) =>
  section?.id !== undefined && section?.id !== null
    ? `extra:${section.id}`
    : "";

/** Catalog type 1–7 (Custom…Interests). */
export const catalogKindOf = (section) => {
  const raw = Number(section?.kind ?? section?.id);
  if (raw >= 1 && raw <= 7) return raw;
  return 1;
};

export const findExtraByRef = (extras, ref) =>
  (extras || []).find((section) => extraRefOf(section) === ref);

export const kindFromRef = (ref, extras = []) => {
  const section = findExtraByRef(extras, ref);
  if (section) return catalogKindOf(section);
  const n = extraIdOf(ref);
  return n >= 1 && n <= 7 ? n : 1;
};

export const titleOf = (id, list) => {
  const found = list.find((entry) => entry.id === id);
  return found ? found.title : SECTION_TITLES[id] || id;
};

export const defaultOrder = (data) => {
  const extras = (data?.additionalSections || data?.extras || []).map((section) =>
    extraRefOf(section),
  );
  return [...BASE_SECTION_IDS, ...extras.filter(Boolean)];
};

export const availableSections = (data) => {
  const out = [];
  if (data.summary) out.push({ id: "summary", title: "Summary" });
  if (data.experience?.length) out.push({ id: "experience", title: "Experience" });
  if (data.education?.length) out.push({ id: "education", title: "Education" });
  const skillEntries = toSkillList(data.skills);
  if (skillEntries.some((s) => s.name)) out.push({ id: "skills", title: "Skills" });
  for (const section of data.extras || []) {
    if (!extraSectionHasContent(section)) continue;
    const id = extraRefOf(section);
    const kind = catalogKindOf(section);
    out.push({
      id,
      kind,
      title:
        (section.title && String(section.title).trim()) ||
        (kind === 5 ? "Languages" : "Additional"),
    });
  }
  return out;
};

/** All extras for Customize reorder (including empty ones). */
export const listExtraSections = (extras = []) =>
  (extras || []).map((section) => ({
    id: extraRefOf(section),
    kind: catalogKindOf(section),
    instanceId: section.id,
    title:
      (section.title && String(section.title).trim()) ||
      (catalogKindOf(section) === 5 ? "Languages" : "Additional"),
  }));

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

/** Move id one step in a flat order list (Customize Tune). */
export const moveInOrder = (order, id, dir) => {
  const list = Array.isArray(order) ? [...order] : [];
  const pos = list.indexOf(id);
  if (pos < 0) return list;
  const target = dir === "up" ? pos - 1 : pos + 1;
  if (target < 0 || target >= list.length) return list;
  [list[pos], list[target]] = [list[target], list[pos]];
  return list;
};

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

export const placeBefore = (columns, movingId, targetId, after = false) => {
  if (movingId === targetId) return columns.flat();
  const sourceIdx = columns.findIndex((col) => col.includes(movingId));
  const targetIdx = columns.findIndex((col) => col.includes(targetId));
  if (sourceIdx === -1 || targetIdx === -1) return columns.flat();
  const next = columns.map((col, i) =>
    i === sourceIdx
      ? col.filter((id) => id !== movingId)
      : i === targetIdx
        ? [...col]
        : col,
  );
  const stack = next[targetIdx];
  const idx = stack.indexOf(targetId);
  stack.splice(after ? idx + 1 : idx, 0, movingId);
  return next.flat();
};

export const SIDEBAR_SIDE_IDS = new Set(["skills"]);
export const SIDEBAR_EXTRA_IDS = new Set([5, 7]);

export const defaultSideColumn = (id, extras = []) => {
  if (SIDEBAR_SIDE_IDS.has(id)) return 0;
  if (isExtra(id) && SIDEBAR_EXTRA_IDS.has(kindFromRef(id, extras))) return 0;
  return 1;
};

export const defaultSplitColumn = (id) =>
  id === "summary" || id === "experience" ? 0 : 1;

export const columnsWithSide = (ids, sectionCols = {}, extras = []) => {
  const side = ids.filter(
    (id) => (sectionCols?.[id] ?? defaultSideColumn(id, extras)) === 0,
  );
  const main = ids.filter((id) => !side.includes(id));
  return [side, main];
};

export const columnsSplit = (ids, sectionCols = {}) => {
  const left = ids.filter(
    (id) => (sectionCols?.[id] ?? defaultSplitColumn(id)) === 0,
  );
  const right = ids.filter((id) => !left.includes(id));
  return [left, right];
};
