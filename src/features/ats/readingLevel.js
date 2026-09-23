/** Lightweight reading-level hints from plain text (no network). */

const countSyllables = (word) => {
  const w = String(word || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = cleaned.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
};

export const analyzeReadingLevel = (text = "") => {
  const raw = String(text || "").trim();
  if (!raw) {
    return { words: 0, sentences: 0, grade: null, label: "Add text to analyze" };
  }
  const sentences = Math.max(
    1,
    (raw.match(/[.!?]+/g) || []).length ||
      (raw.includes("\n") ? raw.split(/\n+/).filter(Boolean).length : 1),
  );
  const wordsList = raw.split(/\s+/).filter(Boolean);
  const words = wordsList.length;
  if (!words) {
    return { words: 0, sentences: 0, grade: null, label: "Add text to analyze" };
  }
  const syllables = wordsList.reduce((n, w) => n + countSyllables(w), 0);
  // Flesch–Kincaid grade level
  const grade =
    0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  const g = Math.max(0, Math.round(grade * 10) / 10);
  let label = "College";
  if (g < 6) label = "Easy";
  else if (g < 9) label = "Clear";
  else if (g < 12) label = "Standard";
  else if (g < 14) label = "Formal";
  return { words, sentences, grade: g, label };
};

export const formatReadingHint = (analysis) => {
  if (!analysis || analysis.grade == null) return analysis?.label || "";
  return `Reading level ~ grade ${analysis.grade} (${analysis.label}) · ${analysis.words} words`;
};
