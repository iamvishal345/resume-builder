// Normalize `resume.skills`, which may be either an array of { name, level }
// items or an object keyed by skill name/id, into always-array form so every
// consumer (ATS score, section ordering, JD match) can .filter/.some/.map
// without re-encoding the same shape-guard inline.
//
// Older imports / AI drafts used `rating` instead of `level` — map both.

const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `skill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const normalizeSkill = (skill = {}) => {
  const source =
    typeof skill === "string" ? { name: skill } : skill && typeof skill === "object" ? skill : {};
  const level = Number(source.level ?? source.rating ?? 0);
  return {
    key: source.key || newKey(),
    name: String(source.name || "").trim(),
    level: Number.isFinite(level) ? Math.max(0, Math.min(5, level)) : 0,
  };
};

export const toSkillList = (skills) => {
  const list = Array.isArray(skills) ? skills : Object.values(skills || {});
  return list.map(normalizeSkill);
};
