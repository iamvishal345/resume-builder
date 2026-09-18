// Soft prompts when bullets lack measurable outcomes.
const METRIC_RE = /(\d[\d,.]*\s*%|\$[\d,.]+|\d[\d,.]+\+|#[\d]+|\b\d{2,}\b)/;

export const bulletHasMetric = (text = "") => METRIC_RE.test(String(text));

/** Pull plain-text bullets from HTML work summaries. */
export const extractBullets = (html = "") => {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const items = [...doc.querySelectorAll("li")].map((li) =>
    (li.textContent || "").trim(),
  );
  if (items.length) return items.filter(Boolean);
  const paras = [...doc.querySelectorAll("p")]
    .map((p) => (p.textContent || "").trim())
    .filter(Boolean);
  return paras;
};

/**
 * @returns {{ role: string, company: string, index: number, weak: string[] }[]}
 */
export const findWeakBullets = (workHistory = []) => {
  const out = [];
  workHistory.forEach((entry, index) => {
    const bullets = extractBullets(entry.workSummary);
    const weak = bullets.filter((b) => b.length > 24 && !bulletHasMetric(b));
    if (weak.length) {
      out.push({
        role: entry.positionTitle || "Role",
        company: entry.companyName || "",
        index,
        weak: weak.slice(0, 5),
      });
    }
  });
  return out;
};

export const metricsHint =
  "Strong bullets usually include a number — %, $, headcount, or time saved.";
