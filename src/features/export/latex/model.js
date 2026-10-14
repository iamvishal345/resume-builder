// Shared resume → plain blocks for every LaTeX template.
import { toSkillList } from "@features/resume/skillList";
import {
  extraItemHasContent,
  extraItemLines,
  extraSectionHasContent,
} from "@features/resume/extraContent";
import {
  availableSections,
  catalogKindOf,
  effectiveOrder,
  titleOf,
} from "@features/resume/order";
import { stripHtml } from "@lib/text";
import { escapeLatex } from "./escape.js";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const contentShape = (data = {}) => ({
  summary: data.resumeSummary || data.summary,
  experience: data.workHistory || data.experience,
  education: data.education,
  skills: data.skills,
  extras: data.additionalSections || data.extras,
  additionalSections: data.additionalSections || data.extras,
});

export const displayName = (data = {}) => {
  const pd = data.personalDetails || data.pd || {};
  return [pd.firstName, pd.lastName].filter(Boolean).join(" ");
};

export const formatLatexDate = (value) => {
  if (!value) return "";
  const str = String(value).trim();
  if (!str) return "";
  if (str.toLowerCase() === "present") return "Present";
  const ym = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(str);
  if (ym) {
    const month = MONTHS[Number(ym[2]) - 1];
    return month ? `${month} ${ym[1]}` : str;
  }
  return str;
};

const rangeText = (start, end, current) => {
  const from = formatLatexDate(start);
  const to = current ? "Present" : formatLatexDate(end);
  return [from, to].filter(Boolean).join(" -- ");
};

/** Unescaped contact fragments, in header order. */
export const contactParts = (pd = {}, socialLinks = []) => {
  const location = [pd.address, pd.city, pd.state, pd.country, pd.pinCode]
    .filter(Boolean)
    .join(", ");
  const socials = (socialLinks || [])
    .map((link) => {
      const value = link?.value || link?.url || "";
      if (!value) return "";
      const label = link.descriptionValue || link.label || "";
      return label ? `${label}: ${value}` : value;
    })
    .filter(Boolean);
  return [pd.email, pd.contactNumber || pd.phone, location, ...socials].filter(
    Boolean,
  );
};

/** Rich text as paragraphs and bullet groups. Text is still unescaped. */
export const proseBlocks = (html) => {
  const text = stripHtml(html);
  if (!text) return [];
  const chunks = [];
  let bullets = [];
  const flush = () => {
    if (!bullets.length) return;
    chunks.push({ type: "items", items: bullets.slice() });
    bullets = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("- ")) bullets.push(line.slice(2).trim());
    else {
      flush();
      chunks.push({ type: "para", text: line });
    }
  }
  flush();
  return chunks;
};

export const renderProseBlocks = (blocks) => {
  if (!blocks?.length) return "";
  return blocks
    .map((block) => {
      if (block.type === "items") {
        return [
          "\\begin{itemize}",
          ...block.items.map((item) => `  \\item ${escapeLatex(item)}`),
          "\\end{itemize}",
        ].join("\n");
      }
      return `${escapeLatex(block.text)}\\par`;
    })
    .join("\n");
};

const roleHasContent = (role) =>
  Boolean(
    role?.positionTitle ||
      role?.companyName ||
      role?.location ||
      role?.startDate ||
      role?.endDate ||
      stripHtml(role?.workSummary || ""),
  );

const schoolHasContent = (ed) =>
  Boolean(
    ed?.degree ||
      ed?.fieldOfStudy ||
      ed?.schoolName ||
      ed?.startDate ||
      ed?.endDate ||
      stripHtml(ed?.educationSummary || ed?.description || ""),
  );

/**
 * Structured resume for LaTeX templates.
 * Sections are omitted when they have nothing to print.
 */
export const collectResumeLatex = (data = {}) => {
  const pd = data.personalDetails || data.pd || {};
  const settings = data.resumeSettings || {};
  const shaped = contentShape(data);
  const sections = [];
  const avail = availableSections(shaped);
  const order = effectiveOrder(
    settings.sectionOrder,
    avail.map((section) => section.id),
    shaped,
  );

  for (const id of order) {
    const title = titleOf(id, avail);
    if (id === "summary") {
      const blocks = proseBlocks(shaped.summary || "");
      if (!blocks.length) continue;
      sections.push({ type: "prose", title, blocks });
      continue;
    }
    if (id === "experience") {
      const roles = (shaped.experience || []).filter(roleHasContent);
      if (!roles.length) continue;
      sections.push({
        type: "entries",
        title,
        entries: roles.map((role) => ({
          primary: role.positionTitle || "",
          secondary: [role.companyName, role.location].filter(Boolean).join(", "),
          dates: rangeText(role.startDate, role.endDate, role.disabledendDate),
          blocks: proseBlocks(role.workSummary || ""),
        })),
      });
      continue;
    }
    if (id === "education") {
      const schools = (shaped.education || []).filter(schoolHasContent);
      if (!schools.length) continue;
      sections.push({
        type: "entries",
        title,
        entries: schools.map((ed) => ({
          primary: [ed.degree, ed.fieldOfStudy].filter(Boolean).join(", "),
          secondary: ed.schoolName || "",
          dates: rangeText(ed.startDate, ed.endDate, ed.disabledendDate),
          blocks: proseBlocks(ed.educationSummary || ed.description || ""),
        })),
      });
      continue;
    }
    if (id === "skills") {
      const names = toSkillList(shaped.skills)
        .map((skill) => skill.name)
        .filter(Boolean);
      if (!names.length) continue;
      sections.push({ type: "skills", title, names });
      continue;
    }
    if (id.startsWith("extra:")) {
      const section = (shaped.extras || []).find(
        (item) => `extra:${item.id}` === id || String(item.id) === id.slice(6),
      );
      if (!section || !extraSectionHasContent(section)) continue;
      const kind = catalogKindOf(section);
      const items = (section.data || []).filter((item) =>
        extraItemHasContent(kind, item),
      );
      if (!items.length) continue;
      const lines = items
        .flatMap((item) => extraItemLines(kind, item))
        .map((line) => stripHtml(line))
        .filter(Boolean);
      if (!lines.length) continue;
      sections.push({ type: "lines", title, lines });
    }
  }

  return {
    name: displayName(data),
    designation: pd.designation || "",
    contactParts: contactParts(pd, data.socialLinks || []),
    sections,
  };
};

/** True when the generated TeX body would be an empty page. */
export const latexIsBlank = (data = {}) => {
  const model = collectResumeLatex(data);
  return (
    !model.name &&
    !model.designation &&
    model.contactParts.length === 0 &&
    model.sections.length === 0
  );
};
