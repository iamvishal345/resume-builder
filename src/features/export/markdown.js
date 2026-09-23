// Plain Markdown / text export — ordered sections via effectiveOrder.
import { toSkillList } from "@features/resume/skillList";
import {
  extraItemHasContent,
  extraItemLines,
  extraSectionHasContent,
} from "@features/resume/extraContent";
import {
  availableSections,
  effectiveOrder,
  titleOf,
} from "@features/resume/order";
import { downloadBlob, safeFilename } from "@lib/download";
import { stripHtml } from "@lib/text";

const contentShape = (data = {}) => ({
  summary: data.resumeSummary || data.summary,
  experience: data.workHistory || data.experience,
  education: data.education,
  skills: data.skills,
  extras: data.additionalSections || data.extras,
  additionalSections: data.additionalSections || data.extras,
});

const displayName = (data = {}) => {
  const pd = data.personalDetails || data.pd || {};
  return [pd.firstName, pd.lastName].filter(Boolean).join(" ");
};

export const buildResumeMarkdown = (data = {}) => {
  const pd = data.personalDetails || data.pd || {};
  const settings = data.resumeSettings || {};
  const name = displayName(data);
  const shaped = contentShape(data);
  const lines = [];

  if (name) lines.push(`# ${name}`);
  if (pd.designation) lines.push(`**${pd.designation}**`);
  const contact = [
    pd.email,
    pd.phone,
    [pd.city, pd.country].filter(Boolean).join(", "),
  ].filter(Boolean);
  if (contact.length) lines.push(contact.join(" · "));
  const links = (data.socialLinks || [])
    .map((l) => l?.url || l?.link || "")
    .filter(Boolean);
  if (links.length) lines.push(links.join(" · "));
  lines.push("");

  const avail = availableSections(shaped);
  const order = effectiveOrder(
    settings.sectionOrder,
    avail.map((s) => s.id),
    shaped,
  );

  for (const id of order) {
    const title = titleOf(id, avail);
    if (id === "summary") {
      const body = stripHtml(shaped.summary || "");
      if (!body) continue;
      lines.push(`## ${title}`, "", body, "");
      continue;
    }
    if (id === "experience") {
      const roles = shaped.experience || [];
      if (!roles.length) continue;
      lines.push(`## ${title}`, "");
      for (const role of roles) {
        const head = [role.positionTitle, role.companyName]
          .filter(Boolean)
          .join(" — ");
        if (head) lines.push(`### ${head}`);
        const dates = [
          role.startDate,
          role.endDate || (role.currentlyWorking ? "Present" : ""),
        ]
          .filter(Boolean)
          .join(" – ");
        if (dates) lines.push(`*${dates}*`);
        const body = stripHtml(role.workSummary || "");
        if (body) lines.push("", body);
        lines.push("");
      }
      continue;
    }
    if (id === "education") {
      const eds = shaped.education || [];
      if (!eds.length) continue;
      lines.push(`## ${title}`, "");
      for (const ed of eds) {
        const head = [ed.degree, ed.schoolName].filter(Boolean).join(" — ");
        if (head) lines.push(`### ${head}`);
        const dates = [ed.startDate, ed.endDate].filter(Boolean).join(" – ");
        if (dates) lines.push(`*${dates}*`);
        const body = stripHtml(ed.description || "");
        if (body) lines.push("", body);
        lines.push("");
      }
      continue;
    }
    if (id === "skills") {
      const skills = toSkillList(shaped.skills)
        .map((s) => s.name)
        .filter(Boolean);
      if (!skills.length) continue;
      lines.push(`## ${title}`, "", skills.map((s) => `- ${s}`).join("\n"), "");
      continue;
    }
    if (id.startsWith("extra:")) {
      const extras = shaped.extras || [];
      const section = extras.find(
        (s) => `extra:${s.id}` === id || String(s.id) === id.slice(6),
      );
      if (!section || !extraSectionHasContent(section)) continue;
      const kind = Number(section.kind ?? section.id);
      lines.push(`## ${title}`, "");
      for (const item of section.data || []) {
        if (!extraItemHasContent(kind, item)) continue;
        for (const line of extraItemLines(kind, item)) {
          lines.push(`- ${stripHtml(line)}`);
        }
      }
      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
};

export const buildResumePlainText = (data = {}) =>
  buildResumeMarkdown(data)
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "");

export const downloadResumeMarkdown = (data, filename) => {
  const md = buildResumeMarkdown(data);
  const name = safeFilename(filename || displayName(data));
  downloadBlob(
    new Blob([md], { type: "text/markdown;charset=utf-8" }),
    `${name}.md`,
  );
};

export const downloadResumePlainText = (data, filename) => {
  const text = buildResumePlainText(data);
  const name = safeFilename(filename || displayName(data));
  downloadBlob(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
    `${name}.txt`,
  );
};
