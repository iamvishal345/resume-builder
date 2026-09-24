/**
 * JSON Resume (https://jsonresume.org/) ↔ Cavren store-shaped resume data.
 * Pure functions — safe for Vitest and browser.
 */
import { stripHtmlFlat } from "@lib/text";
import { downloadBlob, safeFilename } from "@lib/download";
import { toSkillList, normalizeSkill } from "@features/resume/skillList";

const SCHEMA =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";

const isoDate = (value) => {
  if (!value) return "";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
};

const htmlFromLines = (lines = []) => {
  const items = lines.map((l) => String(l || "").trim()).filter(Boolean);
  if (!items.length) return "";
  return `<ul>${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
};

const escapeHtml = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const bulletsFromHtml = (html = "") => {
  if (typeof DOMParser === "undefined") {
    return String(html || "")
      .replace(/<li[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .split(/\n+/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const lis = [...doc.querySelectorAll("li")].map((li) =>
    (li.textContent || "").trim(),
  );
  if (lis.length) return lis.filter(Boolean);
  const flat = stripHtmlFlat(html);
  return flat ? [flat] : [];
};

const levelToJson = (level) => {
  const n = Number(level) || 0;
  if (n >= 5) return "Master";
  if (n >= 4) return "Expert";
  if (n >= 3) return "Advanced";
  if (n >= 2) return "Intermediate";
  if (n >= 1) return "Beginner";
  return "";
};

const jsonToLevel = (level) => {
  if (typeof level === "number") return Math.min(5, Math.max(0, level));
  const s = String(level || "").toLowerCase();
  if (/master|expert|native/.test(s)) return 5;
  if (/advanced|fluent|proficient/.test(s)) return 4;
  if (/intermediate|conversational/.test(s)) return 3;
  if (/beginner|basic|elementary/.test(s)) return 2;
  return 3;
};

const splitName = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

const mintKey = (prefix, i) => `${prefix}-${i}-${Date.now().toString(36)}`;

/** Detect JSON Resume (schema hint or basics + work/education). */
export const isJsonResume = (raw) => {
  if (!raw || typeof raw !== "object") return false;
  if (
    raw.type === "resume-builder/resume" ||
    raw.type === "cavren/backup-pack"
  ) {
    return false;
  }
  if (raw.$schema && String(raw.$schema).includes("jsonresume")) return true;
  if (raw.basics && typeof raw.basics === "object") return true;
  return false;
};

/**
 * Cavren store-shaped data → JSON Resume document.
 * @param {object} data - personalDetails, socialLinks, resumeSummary, workHistory, …
 */
export const toJsonResume = (data = {}) => {
  const pd = data.personalDetails || {};
  const name = [pd.firstName, pd.lastName].filter(Boolean).join(" ").trim();
  const locationParts = [pd.city, pd.state, pd.country].filter(Boolean);
  const profiles = (data.socialLinks || [])
    .map((link) => ({
      network: link.descriptionValue || link.network || "",
      url: link.value || link.url || "",
    }))
    .filter((p) => p.network || p.url);

  const work = (data.workHistory || []).map((job) => ({
    name: job.companyName || "",
    position: job.positionTitle || "",
    location: job.location || "",
    startDate: isoDate(job.startDate),
    endDate: job.disabledendDate ? "" : isoDate(job.endDate),
    summary: stripHtmlFlat(job.workSummary || ""),
    highlights: bulletsFromHtml(job.workSummary),
  }));

  const education = (data.education || []).map((ed) => ({
    institution: ed.schoolName || "",
    area: ed.fieldOfStudy || "",
    studyType: ed.degree || "",
    location: ed.location || "",
    startDate: isoDate(ed.startDate),
    endDate: isoDate(ed.endDate),
    score: "",
    courses: [],
    summary: stripHtmlFlat(ed.educationSummary || ""),
  }));

  const skills = toSkillList(data.skills || []).map((s) => ({
    name: s.name || "",
    level: levelToJson(s.level),
    keywords: [],
  }));

  const extras = data.additionalSections || [];
  const byKind = (k) => extras.filter((s) => Number(s.kind ?? s.id) === k);

  const languages = byKind(5).flatMap((sec) =>
    (sec.data || []).map((row) => ({
      language: row.name || row.title || "",
      fluency: levelToJson(row.level) || row.description || "",
    })),
  );

  const certificates = byKind(6).flatMap((sec) =>
    (sec.data || []).map((row) => ({
      name: row.title || row.name || "",
      date: isoDate(row.date || row.endDate),
      issuer: row.issuer || "",
      url: row.url || "",
    })),
  );

  const volunteer = byKind(4).flatMap((sec) =>
    (sec.data || []).map((row) => ({
      organization: row.company || row.title || "",
      position: row.role || row.title || "",
      summary: stripHtmlFlat(row.description || ""),
      startDate: isoDate(row.startDate),
      endDate: isoDate(row.endDate),
    })),
  );

  const projects = byKind(1).flatMap((sec) =>
    (sec.data || []).map((row) => ({
      name: row.title || "",
      description: stripHtmlFlat(row.description || ""),
      highlights: bulletsFromHtml(row.description),
    })),
  );

  const interests = byKind(7).flatMap((sec) =>
    (sec.data || []).map((row) => ({
      name: row.name || row.title || "",
      keywords: [],
    })),
  );

  const references = byKind(3).flatMap((sec) =>
    (sec.data || []).map((row) => ({
      name: row.title || row.name || "",
      reference: stripHtmlFlat(row.description || row.reference || ""),
    })),
  );

  const awards = byKind(2).flatMap((sec) =>
    (sec.data || []).map((row) => ({
      title: row.title || "",
      summary: stripHtmlFlat(row.description || ""),
      date: isoDate(row.date),
    })),
  );

  return {
    $schema: SCHEMA,
    basics: {
      name,
      label: pd.designation || "",
      email: pd.email || "",
      phone: pd.contactNumber || "",
      url: pd.website || "",
      summary: stripHtmlFlat(data.resumeSummary || ""),
      location: {
        address: pd.address || "",
        postalCode: pd.pinCode || "",
        city: pd.city || "",
        region: pd.state || "",
        countryCode: pd.country || "",
      },
      profiles,
    },
    work,
    education,
    skills,
    languages,
    certificates,
    volunteer,
    projects,
    interests,
    references,
    awards,
    meta: {
      canonical: "https://jsonresume.org/schema/",
      version: "v1.0.0",
      lastModified: new Date().toISOString(),
    },
  };
};

/**
 * JSON Resume → Cavren store-shaped patch (CONTENT_KEYS).
 * Photo data URLs are never imported (keep privacy / size local-only).
 */
export const fromJsonResume = (jr = {}) => {
  const basics = jr.basics || {};
  const { firstName, lastName } = splitName(basics.name || "");
  const loc = basics.location || {};

  const personalDetails = {
    firstName,
    lastName,
    designation: basics.label || "",
    email: basics.email || "",
    contactNumber: basics.phone || "",
    city: loc.city || "",
    state: loc.region || "",
    country: loc.countryCode || "",
    address: loc.address || "",
    pinCode: loc.postalCode || "",
    website: basics.url || "",
  };

  const socialLinks = (basics.profiles || []).map((p, i) => ({
    descriptionKey: `s-${i}`,
    descriptionValue: p.network || "Link",
    valueKey: `v-${i}`,
    value: p.url || "",
  }));

  const resumeSummary = basics.summary
    ? `<p>${escapeHtml(basics.summary)}</p>`
    : "";

  const workHistory = (jr.work || []).map((job, i) => ({
    key: mintKey("job", i),
    positionTitle: job.position || "",
    companyName: job.name || job.company || "",
    location: job.location || "",
    startDate: isoDate(job.startDate),
    endDate: isoDate(job.endDate),
    disabledendDate: !job.endDate,
    workSummary:
      htmlFromLines(job.highlights) ||
      (job.summary ? `<p>${escapeHtml(job.summary)}</p>` : ""),
  }));

  const education = (jr.education || []).map((ed, i) => ({
    key: mintKey("edu", i),
    schoolName: ed.institution || "",
    location: ed.location || "",
    degree: ed.studyType || "",
    fieldOfStudy: ed.area || "",
    startDate: isoDate(ed.startDate),
    endDate: isoDate(ed.endDate),
    educationSummary: ed.summary ? `<p>${escapeHtml(ed.summary)}</p>` : "",
  }));

  const skills = (jr.skills || []).map((s) =>
    normalizeSkill({
      name: s.name || "",
      level: jsonToLevel(s.level),
    }),
  );

  const additionalSections = [];
  const pushExtra = (kind, title, data) => {
    if (!data.length) return;
    additionalSections.push({
      id: kind,
      kind,
      title,
      key: `extra-${kind}`,
      data,
    });
  };

  pushExtra(
    5,
    "Languages",
    (jr.languages || []).map((row, i) => ({
      key: mintKey("lang", i),
      name: row.language || "",
      level: jsonToLevel(row.fluency),
    })),
  );

  pushExtra(
    6,
    "Certifications",
    (jr.certificates || []).map((row, i) => ({
      key: mintKey("cert", i),
      title: row.name || "",
      issuer: row.issuer || "",
      date: isoDate(row.date),
      url: row.url || "",
    })),
  );

  pushExtra(
    4,
    "Volunteer",
    (jr.volunteer || []).map((row, i) => ({
      key: mintKey("vol", i),
      title: row.organization || row.position || "",
      description: row.summary ? `<p>${escapeHtml(row.summary)}</p>` : "",
      startDate: isoDate(row.startDate),
      endDate: isoDate(row.endDate),
    })),
  );

  pushExtra(
    1,
    "Projects",
    (jr.projects || []).map((row, i) => ({
      key: mintKey("proj", i),
      title: row.name || "",
      description:
        htmlFromLines(row.highlights) ||
        (row.description ? `<p>${escapeHtml(row.description)}</p>` : ""),
    })),
  );

  pushExtra(
    7,
    "Interests",
    (jr.interests || []).map((row, i) => ({
      key: mintKey("int", i),
      name: row.name || "",
    })),
  );

  pushExtra(
    3,
    "References",
    (jr.references || []).map((row, i) => ({
      key: mintKey("ref", i),
      title: row.name || "",
      description: row.reference ? `<p>${escapeHtml(row.reference)}</p>` : "",
    })),
  );

  pushExtra(
    2,
    "Accomplishments",
    (jr.awards || []).map((row, i) => ({
      key: mintKey("aw", i),
      title: row.title || "",
      description: row.summary ? `<p>${escapeHtml(row.summary)}</p>` : "",
      date: isoDate(row.date),
    })),
  );

  return {
    personalDetails,
    socialLinks,
    resumeSummary,
    workHistory,
    education,
    skills,
    additionalSections,
    resumeSettings: {},
    coverLetter: { recipient: "", body: "" },
  };
};

export const downloadJsonResume = (data, fileName = "resume") => {
  const doc = toJsonResume(data);
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `${safeFilename(fileName)}.json`);
};

export const parseJsonResumeText = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not valid JSON." };
  }
  if (!isJsonResume(parsed)) {
    return { ok: false, error: "This file is not a JSON Resume." };
  }
  return { ok: true, data: fromJsonResume(parsed), raw: parsed };
};
