// JD keyword gap analysis — pure client-side.
// Extracts candidate keywords (1–3 word terms) from a job description and
// reports which already appear on the resume text vs which are missing.

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "of", "at", "by",
  "for", "with", "from", "to", "in", "on", "as", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "should", "can", "could", "may", "might", "must", "shall", "not",
  "no", "nor", "yes", "we", "you", "they", "them", "he", "she", "it", "its",
  "this", "that", "these", "those", "our", "your", "their", "his", "her",
  "theirs", "what", "which", "who", "whom", "whose", "when", "where", "why",
  "how", "all", "any", "both", "each", "few", "more", "most", "other", "some",
  "such", "only", "own", "same", "so", "than", "too", "very", "s", "t", "ll",
  "job", "role", "position", "candidate", "candidates", "team", "work",
  "working", "company", "experience", "years", "skills", "including", "etc",
  "e", "g", "ie", "about", "across", "after", "against", "along", "among",
  "around", "before", "between", "during", "within", "without", "per", "via",
  "plus", "using", "able", "also", "etc", "responsibilities", "requirements",
]);

const clean = (text) =>
  (text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const wordsOf = (text) =>
  clean(text)
    .toLowerCase()
    .match(/[a-z0-9+#][a-z0-9+.#-]*/g) || [];

const normalizeTerm = (term) => term.toLowerCase().replace(/[-.]/g, " ").trim();

// Substring presence with word boundaries so "react" doesn't match "reactive".
const hasTerm = (haystack, term) => {
  const escaped = term.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#])${escaped}([^a-z0-9+#]|$)`, "i").test(
    haystack
  );
};

const ngrams = (words, n) => {
  const out = [];
  for (let i = 0; i <= words.length - n; i += 1) {
    const gram = words.slice(i, i + n);
    if (gram.length && !STOPWORDS.has(gram[0]) && !STOPWORDS.has(gram[n - 1])) {
      out.push(gram.join(" "));
    }
  }
  return out;
};

// Collect every text field across the resume model that an ATS would read.
export const resumeTextOf = (data) => {
  const pd = data.pd || {};
  const parts = [
    pd.firstName, pd.lastName, pd.designation, pd.email, pd.city, pd.state,
    pd.country, pd.address, pd.pinCode, pd.contactNumber,
    ...(data.socialLinks || []).map((l) => l.descriptionValue).filter(Boolean),
    (data.summary || ""),
    ...(data.experience || []).flatMap((e) => [
      e.positionTitle, e.companyName, e.workSummary,
    ]),
    ...(data.education || []).flatMap((e) => [e.degree, e.schoolName]),
    ...(data.skills || []).map((s) => s.name),
    ...(data.extras || []).flatMap((s) =>
      (s.data || []).map((i) => i.name || i.value)
    ),
  ];
  return clean(parts.join(" . "));
};

export const analyzeJd = (jdText, resumeText) => {
  const jd = clean(jdText);
  const resume = resumeText || "";
  if (!jd) {
    return { matched: 0, missing: 0, total: 0, keywords: [], resumeText: resume };
  }

  const words = wordsOf(jd);
  const counts = new Map();
  const freq = (term) => counts.get(term) || 0;

  for (const term of [...ngrams(words, 1), ...ngrams(words, 2), ...ngrams(words, 3)]) {
    counts.set(term, (counts.get(term) || 0) + 1);
  }

  const candidates = [...counts.entries()]
    .filter(([term, count]) => {
      const len = normalizeTerm(term).length;
      if (len < 3) return false;
      if (len <= 4) return count >= 3; // short generic terms need repetition
      return count >= 2 || len >= 9;
    })
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);

  const keywords = candidates.slice(0, 40).map(([term, count]) => ({
    term,
    count,
    present: hasTerm(resume, term),
  }));

  const present = keywords.filter((k) => k.present);
  const missing = keywords.filter((k) => !k.present);

  return {
    matched: present.length,
    missingCount: missing.length,
    total: keywords.length,
    keywords,
    present,
    missing,
    resumeText: resume,
  };
};