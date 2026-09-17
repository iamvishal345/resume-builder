const STEP_PD = 0;
const STEP_SUMMARY = 1;
const STEP_EXPERIENCE = 2;
const STEP_EDUCATION = 3;
const STEP_SKILLS = 4;

const issue = (id, step, severity, label, hint) => ({
  id,
  step,
  severity,
  label,
  hint,
  ok: false,
});

const cleanText = (html = "") =>
  (html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const norm = (s = "") => cleanText(s).toLowerCase().replace(/[^a-z0-9+\s]/g, " ").replace(/\s+/g, " ").trim();

const digits = (s = "") => (s || "").replace(/[^0-9+]/g, "").trim();

const MONTH = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, september: 9,
  oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const parseDate = (raw) => {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  const yearMatch = s.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
  if (!year) return null;
  let month = null;
  const parts = s.replace(/[,\s]+/g, " ").split(" ").filter(Boolean);
  for (const p of parts) {
    if (MONTH[p]) { month = MONTH[p]; break; }
    if (/^\d{1,2}$/.test(p)) {
      const n = parseInt(p, 10);
      if (n >= 1 && n <= 12 && !parts.some((x) => MONTH[x])) { month = n; break; }
    }
    if (/^\d{1,2}\/$/.test(p)) {
      const n = parseInt(p, 10);
      if (n >= 1 && n <= 12) { month = n; break; }
    }
  }
  return { year, month };
};

const isOpenEnded = (entry) =>
  !!entry.disabledendDate || /^(present|current|now|ongoing|till date)$/i.test(String(entry.endDate || "").trim());

const intervalOf = (entry) => {
  const start = parseDate(entry.startDate);
  const end = isOpenEnded(entry) ? { year: 9999, month: 12 } : parseDate(entry.endDate);
  return { start, end };
};

const intervalStart = (i) => i.start ? i.start.year * 12 + (i.start.month || 1) : -Infinity;
const intervalEnd = (i) => i.end ? i.end.year * 12 + (i.end.month || 12) : Infinity;

const overlaps = (a, b) => {
  const as = intervalStart(a), ae = intervalEnd(a), bs = intervalStart(b), be = intervalEnd(b);
  if (as > ae || bs > be) return true; // malformed treat as overlap to flag
  return as <= be && bs <= ae;
};

const sameDate = (a, b) => a && b && a.year === b.year && a.month === b.month;

// Term lexicon — broad enough to catch common resume keywords without too much noise.
const SKILL_LEXICON = new Set([
  // languages
  "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "php", "swift", "kotlin",
  "go", "golang", "rust", "scala", "r", "matlab", "sql", "nosql", "graphql", "graphql",
  // frameworks / libs
  "react", "reactjs", "react.js", "nextjs", "next.js", "vue", "vuejs", "vue.js", "angular", "svelte",
  "node", "nodejs", "node.js", "express", "expressjs", "django", "flask", "fastapi", "rails",
  "spring", "springboot", "spring boot", "laravel", ".net", "dotnet", "fastapi",
  // infra / cloud
  "aws", "gcp", "google cloud", "azure", "docker", "kubernetes", "k8s", "terraform", "ansible",
  "jenkins", "github actions", "ci/cd", "cicd", "circleci", "vercel", "netlify", "heroku", "cloudflare",
  // data / ml
  "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch", "dynamodb",
  "pandas", "numpy", "scikit-learn", "scikit", "tensorflow", "pytorch", "keras", "nlp",
  "machine learning", "deep learning", "data science", "data engineering", "etl",
  // frontend / mobile
  "html", "css", "sass", "scss", "tailwind", "tailwindcss", "material ui", "bootstrap", "jquery",
  "responsive design", "a11y", "accessibility", "seo", "web performance",
  "react native", "flutter", "ios", "android", "swiftui", "jetpack compose", "xamarin",
  // practices / methodologies
  "agile", "scrum", "kanban", "jira", "confluence", "git", "github", "gitlab", "bitbucket",
  "tdd", "test-driven", "unit testing", "integration testing", "e2e testing", "cypress", "playwright", "jest", "mocha", "pytest",
  "microservices", "microservices", "serverless", "event-driven", "microservices", "rest", "restful", "rest api", "soap",
  "oauth", "jwt", "websocket", "grpc", "graphql",
  // tools / platforms
  "figma", "sketch", "adobe", "photoshop", "illustrator", "zeplin", "invision", "miro",
  "notion", "slack", "teams", "google analytics", "mixpanel", "amplitude",
  // soft skills commonly listed
  "leadership", "mentoring", "mentee", "communication", "public speaking",
  "problem solving", "analytical", "cross-functional", "cross functional",
  "stakeholder management", "product sense", "user experience", "ux", "ui",
]);

const normalizeSkill = (s = "") => String(s).trim().toLowerCase();
const tokenize = (s = "") => norm(s).split(" ").filter(Boolean);

const findSkillMismatches = (summaryHtml, skillsList = []) => {
  const summary = norm(summaryHtml);
  if (!summary || !skillsList.length) return [];
  const skillTokens = skillsList.map(normalizeSkill).filter(Boolean);
  const seen = new Set(skillTokens);
  const hits = [];
  for (const term of SKILL_LEXICON) {
    if (seen.has(term)) continue;
    if (!term.includes(" ") ? new RegExp(`(?:^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|\\s)`, "i").test(summary) : summary.includes(term)) {
      if (!hits.includes(term)) hits.push(term);
    }
  }
  return hits.slice(0, 6);
};

const duplicateValues = (arr = []) => {
  const freq = new Map();
  for (const item of arr) {
    const k = String(item).trim().toLowerCase();
    if (!k) continue;
    freq.set(k, (freq.get(k) || 0) + 1);
  }
  return [...freq.entries()].filter(([, c]) => c > 1).map(([v]) => v);
};

export const computeCoherenceIssues = (data) => {
  const pd = data.pd || {};
  const summary = data.summary || "";
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const socialLinks = data.socialLinks || [];

  const issues = [];

  // Date overlaps in experience
  const expIntervals = experience.map((e, i) => ({ i, ...intervalOf(e), label: e.positionTitle || e.companyName || `Role ${i + 1}` }));
  for (let i = 0; i < expIntervals.length; i++) {
    const a = expIntervals[i];
    if (a.start && a.end && intervalStart(a) > intervalEnd(a)) {
      issues.push(issue(
        `exp-start-after-end-${i}`, STEP_EXPERIENCE, "error",
        `Start date is after end date in “${a.label}”`,
        "Correct the dates so the end comes after the start.",
      ));
    }
    for (let j = i + 1; j < expIntervals.length; j++) {
      const b = expIntervals[j];
      if (a.start && a.end && b.start && b.end && overlaps(a, b)) {
        issues.push(issue(
          `exp-overlap-${i}-${j}`, STEP_EXPERIENCE, "warning",
          `“${a.label}” and “${b.label}” overlap`,
          "These two roles share the same timeframe. If intentional (concurrent roles), this is fine — otherwise adjust dates.",
        ));
      }
    }
  }

  // Date overlaps in education
  const eduIntervals = education.map((e, i) => ({ i, ...intervalOf(e), label: e.degree || e.schoolName || `Education ${i + 1}` }));
  for (let i = 0; i < eduIntervals.length; i++) {
    const a = eduIntervals[i];
    if (a.start && a.end && intervalStart(a) > intervalEnd(a)) {
      issues.push(issue(
        `edu-start-after-end-${i}`, STEP_EDUCATION, "error",
        `Start date is after end date in “${a.label}”`,
        "Correct the dates so the end comes after the start.",
      ));
    }
    for (let j = i + 1; j < eduIntervals.length; j++) {
      const b = eduIntervals[j];
      if (a.start && a.end && b.start && b.end && overlaps(a, b)) {
        issues.push(issue(
          `edu-overlap-${i}-${j}`, STEP_EDUCATION, "warning",
          `“${a.label}” and “${b.label}” overlap`,
          "These two education entries overlap. Adjust dates if one finished before the other.",
        ));
      }
    }
  }

  // Summary mentions skills not in skills list
  const skillMismatches = findSkillMismatches(summary, skills.map((s) => s.name));
  if (skillMismatches.length) {
    issues.push(issue(
      "summary-skill-mismatch", STEP_SUMMARY, "warning",
      "Summary mentions skills not in your skills list",
      `Consider adding: ${skillMismatches.join(", ")}.`,
    ));
  }

  // Duplicate contacts
  const emails = [pd.email, ...socialLinks.map((l) => l.value)].filter(Boolean);
  const dupEmails = duplicateValues(emails);
  if (dupEmails.length) {
    issues.push(issue(
      "dup-emails", STEP_PD, "warning",
      "Duplicate email address",
      `Repeated: ${dupEmails.join(", ")}.`,
    ));
  }
  const phones = [pd.contactNumber, ...socialLinks.map((l) => l.value)].filter((v) => /\d{5,}/.test(String(v)));
  const dupPhones = duplicateValues(phones.map(digits));
  if (dupPhones.length) {
    issues.push(issue(
      "dup-phones", STEP_PD, "warning",
      "Duplicate phone number",
      `Repeated: ${dupPhones.join(", ")}.`,
    ));
  }

  // Duplicate social links
  const dupLinks = duplicateValues(socialLinks.map((l) => `${normalizeSkill(l.descriptionValue)}|${normalizeSkill(l.value)}`));
  if (dupLinks.length) {
    issues.push(issue(
      "dup-social", STEP_PD, "warning",
      "Duplicate social link entries",
      "Remove the repeated social link rows.",
    ));
  }

  // Duplicate skills
  const dupSkills = duplicateValues(skills.map((s) => s.name));
  if (dupSkills.length) {
    issues.push(issue(
      "dup-skills", STEP_SKILLS, "warning",
      "Duplicate skills listed",
      `Repeated: ${dupSkills.join(", ")}. Remove duplicates.`,
    ));
  }

  // Duplicate roles
  const roleKeys = experience.map((e) => `${normalizeSkill(e.positionTitle)}|${normalizeSkill(e.companyName)}|${normalizeSkill(e.startDate)}|${normalizeSkill(e.endDate)}`);
  const dupRoles = duplicateValues(roleKeys);
  if (dupRoles.length) {
    issues.push(issue(
      "dup-roles", STEP_EXPERIENCE, "warning",
      "Duplicate role entries",
      "You have repeated roles with the same title, company, and dates.",
    ));
  }

  return { issues, checked: Math.max(expIntervals.length, eduIntervals.length, skills.length, 1) };
};