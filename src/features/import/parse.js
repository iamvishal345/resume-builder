// Parses plain-text resume text into the store's data model.
// Heuristic only — the parsed result is previewed before the user applies it.

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const htmlOfItems = (items) => {
  // items: [{ bullet, text }]
  if (!items.length) return "";
  const blocks = [];
  let ulOpen = false;
  const close = () => { if (ulOpen) { blocks.push("</ul>"); ulOpen = false; } };
  const push = (text, bullet) => {
    if (bullet && !ulOpen) { close(); blocks.push("<ul>"); ulOpen = true; }
    if (!bullet && ulOpen) close();
    blocks.push(bullet ? `<li>${escapeHtml(text)}</li>` : `<p>${escapeHtml(text)}</p>`);
  };
  for (const it of items) push(it.text, it.bullet);
  close();
  return blocks.join("");
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s|•,]+\b/i;
const LOC_RE = /\b([A-Za-z .'-]+?)\s*,\s*([A-Z]{2})(?:\s*\d{5})?\b/;

const MONTHS =
  "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(?:uary|ch|il|e|y|ber|ust|t|r)?\\.?";
const YEAR = "(?:19|20)\\d{2}";
const DATE_RANGE_RE = new RegExp(
  `\\b((${MONTHS}\\s*)?${YEAR})\\s*(?:[-–—]|\\s+to\\s+)\\s*((present|current|now|today)|((${MONTHS}\\s*)?${YEAR}))`,
  "i"
);
const SINGLE_YEAR_RE = new RegExp(`\\b((${MONTHS}\\s*)?${YEAR})\\b`, "i");

const looksLikeDate = (text) => DATE_RANGE_RE.test(text) || /\b(19|20)\d{2}\b/.test(text) || /present\b/i.test(text);

const findRange = (text) => {
  const t = (s) => (s || "").trim();
  const m = DATE_RANGE_RE.exec(text);
  if (m) {
    const endRaw = t(m[3]);
    const start = t(m[1]);
    const end = /present|current|now|today/i.test(endRaw) ? "Present" : t(m[5]);
    return { start: start || "Present", end };
  }
  const m2 = SINGLE_YEAR_RE.exec(text);
  if (m2) return { start: "", end: t(m2[1]) };
  return { start: "", end: "" };
};

const SECTION_KEYS = [
  [/^(professional\s+)?summary$/i, "summary"],
  [/^(profile|objective|career\s+objective)$/i, "summary"],
  [/^(work\s+)?(experience|employment(\s+history)?|professional\s+experience|work\s+history)$/i, "experience"],
  [/^(education|educational\s+(qualification|background)|academics)$/i, "education"],
  [/^(technical\s+|core\s+|key\s+|computer\s+|professional\s+)?(skills|skill\s+set|competencies|expertise)$/i, "skills"],
  [/^certifications?$/i, "certifications"],
  [/^projects?$/i, "projects"],
  [/^volunteer(ing)?(\s+experience)?$/i, "volunteer"],
  [/^references?$/i, "references"],
  [/^languages?$/i, "languages"],
  [/^interests?$|^hobbies?$/i, "interests"],
  [/^awards?(\s+and\s+honors)?$/i, "awards"],
  [/^publications?$/i, "publications"],
  [/^(additional|certifications? and trainings|other|extras?)($|\s*:)/i, "extra"],
];

const SECTION_TITLES = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  projects: "Projects",
  volunteer: "Volunteer Experience",
  references: "References",
  languages: "Languages",
  interests: "Interests",
  awards: "Awards",
  publications: "Publications",
  extra: "Additional",
};

const EXTRA_SECTION_ID = {
  certifications: { id: 4, title: "Certifications" },
  languages: { id: 5, title: "Languages" },
  interests: { id: 7, title: "Interests" },
  volunteer: { id: 3, title: "Volunteer Experience" },
  references: { id: 6, title: "References" },
};

const sectionKeyFor = (line) => {
  const t = line.replace(/:+\s*$/, "").trim();
  for (const [re, key] of SECTION_KEYS) {
    if (re.test(t)) return key;
  }
  return null;
};

const splitLines = (text) =>
  text.replace(/\r/g, "").split("\n").map((l) => l.trim());

const isBullet = (line) => /^[-*•·▪◦]\s?/.test(line);

const isContact = (line) =>
  EMAIL_RE.test(line) || PHONE_RE.test(line) || URL_RE.test(line) || LOC_RE.test(line);

const looksLikeHeader = (line) => {
  if (isBullet(line) || isContact(line)) return false;
  if (looksLikeDate(line)) return true;
  if (line.length < 90 && /^[A-Z0-9][^.]{0,80}$/.test(line)) {
    // Title-ish line: starts uppercase, short, no sentence-ending period.
    const words = line.split(/\s+/);
    if (words.length <= 5) return true;
  }
  return false;
};

const parseHeader = (line) => {
  let rest = line;
  const { start, end } = findRange(rest);
  rest = rest.replace(DATE_RANGE_RE, " ").replace(SINGLE_YEAR_RE, " ").replace(/present\b/i, " ");
  let company = "";
  let title = "";
  rest = rest.replace(/[|•·\-–—]\s*$/, "").trim();
  const atMatch = rest.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) {
    title = atMatch[1].trim();
    company = atMatch[2].trim();
  } else {
    const dash = rest.split(/\s+[-–—]\s+/);
    if (dash.length >= 2) {
      title = dash[0].trim();
      company = dash.slice(1).join(" - ").trim();
    } else {
      const comma = rest.match(/^([^,]+),\s+([A-Z][^,]+)$/);
      if (comma) {
        title = comma[1].trim();
        company = comma[2].trim();
      } else {
        title = rest;
      }
    }
  }
  return { title, company, start, end };
};

const parseNameAndDetails = (headerLines) => {
  const pd = {};
  const nameParts = [];
  for (const line of headerLines) {
    if (!line) continue;
    const email = line.match(EMAIL_RE);
    if (email) { pd.email = email[0]; continue; }
    if (PHONE_RE.test(line)) { pd.contactNumber = line.match(PHONE_RE)[0]; continue; }
    if (URL_RE.test(line)) continue;
    const loc = line.match(LOC_RE);
    if (loc) {
      pd.city = loc[1].trim();
      pd.state = loc[2];
      continue;
    }
    // Non-contact line → name or designation
    if (/^[A-Z][A-Za-z' .-]{1,50}$/.test(line) && line.split(/\s+/).length <= 4 && !nameParts.length) {
      nameParts.push(line);
    } else if (!pd.designation && line.length < 90 && !nameParts.length) {
      nameParts.push(line);
    } else if (!pd.designation) {
      pd.designation = line;
    }
  }
  if (nameParts.length) {
    const words = nameParts[0].split(/\s+/);
    pd.firstName = words[0];
    pd.lastName = words.slice(1).join(" ");
  }
  return pd;
};

const stripBullet = (line) => line.replace(/^[-*•·▪◦]\s?/, "").trim();

export const parseResumeText = (text) => {
  const lines = splitLines(text || "");
  const sections = {}; // key -> array of lines
  const order = [];
  let current = null;
  for (const raw of lines) {
    const key = sectionKeyFor(raw);
    if (key) {
      if (!sections[key]) sections[key] = [];
      if (!order.includes(key)) order.push(key);
      current = key;
      continue;
    }
    if (current === null) {
      if (!sections._head) sections._head = [];
      sections._head.push(raw);
      continue;
    }
    sections[current].push(raw);
  }

  const pd = parseNameAndDetails(sections._head || []);

  const summaryItems = (sections.summary || []).map((l) => ({
    bullet: isBullet(l),
    text: stripBullet(l),
  }));
  const summary = htmlOfItems(summaryItems.filter((i) => i.text));

  const experience = [];
  const expLines = sections.experience || [];
  let entry = null;
  for (const raw of expLines) {
    if (!raw) continue;
    const line = stripBullet(raw);
    if (!entry) {
      const h = parseHeader(line);
      entry = { positionTitle: h.title, companyName: h.company, startDate: h.start || "", endDate: h.end || "", workSummary: "", items: [] };
      if (h.start || h.end) { entry.startDate = h.start; entry.endDate = h.end; }
      experience.push(entry);
      continue;
    }
    if (isBullet(raw) || (!looksLikeHeader(line) && !looksLikeDate(line))) {
      entry.items.push({ bullet: isBullet(raw), text: line });
    } else {
      const h = parseHeader(line);
      entry = { positionTitle: h.title, companyName: h.company, startDate: h.start, endDate: h.end, workSummary: "", items: [] };
      experience.push(entry);
    }
  }
  for (const e of experience) {
    e.workSummary = htmlOfItems(e.items.filter((i) => i.text));
    delete e.items;
  }

  const education = [];
  const eduLines = sections.education || [];
  let edu = null;
  for (const raw of eduLines) {
    if (!raw) continue;
    const line = stripBullet(raw);
    if (!edu) {
      const h = parseHeader(line);
      edu = { degree: h.title, schoolName: h.company, startDate: h.start, endDate: h.end };
      education.push(edu);
      continue;
    }
    if (isBullet(raw) || !looksLikeHeader(line)) continue;
    const h = parseHeader(line);
    edu = { degree: h.title, schoolName: h.company, startDate: h.start, endDate: h.end };
    education.push(edu);
  }

  const skills = [];
  if (sections.skills) {
    const skText = sections.skills.join(" ").replace(/\s*[,|•·]\s*/g, "|");
    const names = skText
      .split("|")
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s && s.length <= 40);
    for (const name of names) {
      const ratingMatch = name.match(/(\d{1,2})\s*\/\s*10|\b(\d{1,3})\s*%|(●+|[○●]\s*[○●]*)$/);
      if (ratingMatch) {
        const rate = ratingMatch[1] ? Math.max(1, Math.min(5, Math.round(Number(ratingMatch[1]) / 2))) : 6 - (ratingMatch[3] ? ratingMatch[3].length : 3);
        skills.push({ name: name.replace(/(\d{1,2}\s*\/\s*10|\b\d{1,3}\s*%|●+\s*[○●]*)/g, "").trim(), rating: Math.max(1, Math.min(5, rate)) });
      } else {
        skills.push({ name, rating: 1 });
      }
    }
  }

  const extras = [];
  for (const key of order) {
    if (key === "summary" || key === "experience" || key === "education" || key === "skills") continue;
    const items = (sections[key] || [])
      .map((l) => l.replace(/^[-*•·▪◦]\s?/, "").trim())
      .filter(Boolean);
    if (!items.length) continue;
    const mapped = EXTRA_SECTION_ID[key];
    if (mapped) {
      extras.push({ id: mapped.id, title: mapped.title, data: items.slice(0, 20).map((name) => ({ name })) });
    } else {
      extras.push({
        id: 1,
        title: SECTION_TITLES[key] || key,
        data: items.slice(0, 20).map((name) => ({ name })),
      });
    }
  }

  return { pd, summary, experience, education, skills, extras, sections: order };
};