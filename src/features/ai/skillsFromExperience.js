import { aiGenerate, htmlToText, isAiAvailable } from "@features/ai/provider";
import { toSkillList, normalizeSkill } from "@features/resume/skillList";

const SYSTEM =
  "You extract hard skills and tools from resume experience text. Return ONLY a JSON array of short skill name strings (max 12). No markdown, no commentary. Prefer concrete technologies and methods already implied by the text; never invent employers or achievements.";

/**
 * Propose skills from work history HTML. Returns normalized skill objects
 * that are not already in `existing`.
 */
export const suggestSkillsFromExperience = async (
  workHistory = [],
  existing = [],
) => {
  if (!isAiAvailable()) {
    throw new Error("Enable AI in preferences first (Chrome AI or your API key).");
  }
  const blobs = (workHistory || [])
    .map((role) => {
      const head = [role.positionTitle, role.companyName].filter(Boolean).join(" at ");
      const body = htmlToText(role.workSummary || "");
      return [head, body].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
  if (!blobs.trim()) {
    throw new Error("Add some experience bullets first.");
  }
  const raw = await aiGenerate({
    system: SYSTEM,
    user: `Experience:\n${blobs.slice(0, 6000)}`,
  });
  let names = [];
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    names = JSON.parse(match ? match[0] : raw);
  } catch {
    names = String(raw)
      .split(/[\n,]/)
      .map((s) => s.replace(/^[-*•\d.\s"]+|["\s]+$/g, "").trim())
      .filter(Boolean);
  }
  if (!Array.isArray(names)) names = [];
  const have = new Set(
    toSkillList(existing)
      .map((s) => (s.name || "").trim().toLowerCase())
      .filter(Boolean),
  );
  return names
    .map((n) => String(n || "").trim())
    .filter((n) => n && !have.has(n.toLowerCase()))
    .slice(0, 12)
    .map((name) => normalizeSkill({ name, level: 3 }));
};
