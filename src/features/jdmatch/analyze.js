import { toSkillList } from "@features/resume/skillList";

// JD keyword gap analysis — pure client-side.
// Extracts high-signal candidate keywords from a job description and
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
  // Generic job posting boilerplate & HR filler
  "job", "role", "position", "candidate", "candidates", "team", "work",
  "working", "company", "experience", "years", "skills", "including", "etc",
  "e", "g", "ie", "about", "across", "after", "against", "along", "among",
  "around", "before", "between", "during", "within", "without", "per", "via",
  "plus", "using", "able", "also", "responsibilities", "requirements",
  "qualifications", "preferred", "minimum", "degree", "bachelor", "bachelors",
  "master", "masters", "phd", "knowledge", "strong", "excellent", "written",
  "verbal", "communication", "environment", "opportunity", "employer",
  "equal", "gender", "location", "full", "time", "part", "salary", "benefits",
  "duties", "joining", "growth", "success", "drive", "deliver", "impact",
  "building", "leading", "managing", "help", "make", "must", "have", "ability",
  "seeking", "proven", "track", "record", "orientation", "race", "color",
  "religion", "national", "origin", "disability", "status", "veteran",
  "sexual", "identity", "applicant", "applicants", "role", "roles",
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

const normalizeTerm = (term) =>
  term.toLowerCase().replace(/[-.]/g, " ").trim();

// Strip common inflection suffixes for flexible matching
const stem = (word) =>
  word
    .toLowerCase()
    .replace(/(?:ing|es|s|ed)$/i, "");

// Substring presence with word boundaries & flexible stem matching.
const hasTerm = (haystack, term) => {
  const normHaystack = clean(haystack).toLowerCase();
  const normTerm = normalizeTerm(term);

  // Exact or word boundary match
  const escaped = normTerm.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`(^|[^a-z0-9+#])${escaped}([^a-z0-9+#]|$)`, "i").test(normHaystack)) {
    return true;
  }

  // Stemmed word match for multi-word or single-word terms
  const termStems = normTerm.split(/\s+/).map(stem).filter(Boolean);
  if (!termStems.length) return false;

  const haystackWords = wordsOf(normHaystack).map(stem);
  return termStems.every((st) => haystackWords.includes(st));
};

const ngrams = (words, n) => {
  const out = [];
  for (let i = 0; i <= words.length - n; i += 1) {
    const gram = words.slice(i, i + n);
    // Every token in the n-gram must be a non-stopword
    if (gram.length && gram.every((w) => !STOPWORDS.has(w))) {
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
    ...(data.socialLinks || []).flatMap((l) =>
      [l.value, l.descriptionValue].filter(Boolean),
    ),
    (data.summary || ""),
    ...(data.experience || []).flatMap((e) => [
      e.positionTitle, e.companyName, e.workSummary,
    ]),
    ...(data.education || []).flatMap((e) => [e.degree, e.schoolName]),
    ...toSkillList(data.skills).map((s) => s.name),
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
    return { matched: 0, missingCount: 0, total: 0, score: 0, keywords: [], present: [], missing: [], resumeText: resume };
  }

  const words = wordsOf(jd);
  const counts = new Map();

  for (const term of [...ngrams(words, 1), ...ngrams(words, 2), ...ngrams(words, 3)]) {
    counts.set(term, (counts.get(term) || 0) + 1);
  }

  // Filter & sort candidate keywords
  let candidates = [...counts.entries()]
    .filter(([term, count]) => {
      const len = normalizeTerm(term).length;
      if (len < 2) return false;
      if (len <= 3) return count >= 2;
      return count >= 1;
    })
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);

  // Sub-phrase deduplication: remove single words that only appear inside longer accepted n-grams
  const multiGrams = candidates.filter(([term]) => term.includes(" ")).map(([t]) => t);
  candidates = candidates.filter(([term, count]) => {
    if (term.includes(" ")) return true;
    // Keep single word if it appears substantially more than multi-word phrases containing it
    const multiCount = multiGrams
      .filter((m) => m.split(" ").includes(term))
      .reduce((sum, m) => sum + (counts.get(m) || 0), 0);
    return count > multiCount;
  });

  const keywords = candidates.slice(0, 30).map(([term, count]) => ({
    term,
    count,
    present: hasTerm(resume, term),
  }));

  const present = keywords.filter((k) => k.present);
  const missing = keywords.filter((k) => !k.present);

  // Calculate weighted match percentage score
  const totalWeight = keywords.reduce((acc, k) => acc + Math.min(k.count, 3), 0);
  const matchedWeight = present.reduce((acc, k) => acc + Math.min(k.count, 3), 0);
  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

  return {
    matched: present.length,
    missingCount: missing.length,
    total: keywords.length,
    score,
    keywords,
    present,
    missing,
    resumeText: resume,
  };
};