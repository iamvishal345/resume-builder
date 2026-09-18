// Client-side DOCX export — single-column ATS-safe by default.
// settings.docxLayout === "preview" is reserved for future richer layout;
// today both paths stay ATS-safe for parser reliability.
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
} from "docx";
import { buildResumeStyle } from "@features/resume/style";
import { toSkillList } from "@features/resume/skillList";
import {
  extraItemHasContent,
  extraItemLines,
  extraSectionHasContent,
} from "@features/resume/extraContent";

const DOCX_FONTS = {
  sans: "Arial",
  grotesk: "Calibri",
  serif: "Georgia",
  elegant: "Palatino Linotype",
  display: "Trebuchet MS",
  slab: "Courier New",
};

const SZ = { body: 22, name: 44, title: 24, section: 22, meta: 20 }; // half-points

const clean = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const inlineText = (node) => {
  if (!node) return "";
  if (node.nodeType === 3) return node.textContent || "";
  if (node.nodeName === "BR") return " ";
  return [...node.childNodes].map(inlineText).join("");
};

// Returns [{ bullet: bool, text }] from a rich-text HTML fragment.
const htmlToRuns = (html) => {
  const out = [];
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        const t = (child.textContent || "").trim();
        if (t) out.push({ bullet: false, text: t });
        continue;
      }
      if (child.nodeName === "P") {
        const t = inlineText(child).trim();
        if (t) out.push({ bullet: false, text: t });
        continue;
      }
      if (child.nodeName === "UL" || child.nodeName === "OL") {
        [...child.children]
          .filter((li) => li.nodeName === "LI")
          .forEach((li) => {
            const t = inlineText(li).trim();
            if (t) out.push({ bullet: true, text: t });
          });
        continue;
      }
      walk(child);
    }
  };
  walk(doc.body);
  return out;
};

const sectionHeading = (title, accent) =>
  new Paragraph({
    spacing: { before: 240, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent } },
    children: [
      new TextRun({ text: title.toUpperCase(), bold: true, size: SZ.section, color: accent }),
    ],
  });

const richParagraphs = (html, ink, muted) => {
  const runs = htmlToRuns(html);
  return runs
    .map((r, i) =>
      new Paragraph({
        spacing: { after: 80 },
        bullet: r.bullet ? { level: 0 } : undefined,
        children: [
          new TextRun({ text: r.text, size: SZ.body, color: ink }),
        ],
      })
    )
    .filter(Boolean);
};

export const buildResumeDocx = async (data, { palette, fontId, settings }) => {
  const vars = buildResumeStyle({ palette, font: { stack: DOCX_FONTS[fontId] || "Arial" }, settings });
  const accent = vars["--r-accent"];
  const ink = vars["--r-ink"];
  const muted = vars["--r-muted"];

  // JSON -> css color always `#rrggbb` hex for docx (strip any non-hex suffix).
  const toHex = (c) => /^#[0-9a-fA-F]{6}$/.test(c) ? c.slice(1) : c.replace("#", "");
  const ACCENT = toHex(accent);
  const INK = toHex(ink);
  const MUTED = toHex(muted);

  const pd = data.pd || {};
  const name = [pd.firstName, pd.lastName].filter(Boolean).join(" ") || "Your Name";

  const contact = [pd.email, pd.contactNumber, [pd.city, pd.state, pd.country].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join("  |  ");

  const children = [];

  children.push(
    new Paragraph({
      alignmentScaled: undefined,
      spacing: { after: 40 },
      children: [new TextRun({ text: name, bold: true, size: SZ.name, color: ACCENT })],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: pd.designation || "Job Title", size: SZ.title, color: MUTED })],
    })
  );
  if (contact) {
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({ text: contact, size: SZ.meta, color: MUTED })],
      })
    );
  }

  if (data.summary) {
    children.push(sectionHeading("Summary", ACCENT));
    children.push(...richParagraphs(data.summary, INK, MUTED));
  }

  if ((data.experience || []).some((e) => e.positionTitle || e.companyName)) {
    children.push(sectionHeading("Experience", ACCENT));
    for (const e of data.experience) {
      if (!e.positionTitle && !e.companyName) continue;
      const line = [
        e.positionTitle,
        e.companyName ? ` — ${e.companyName}` : "",
      ].join("");
      const dates = [e.startDate, e.endDate].filter(Boolean).join(" – ");
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [new TextRun({ text: line, bold: true, size: SZ.body, color: INK })],
        })
      );
      if (dates) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: dates, size: SZ.meta, color: MUTED, italics: true })],
          })
        );
      }
      if (e.workSummary) children.push(...richParagraphs(e.workSummary, INK, MUTED));
    }
  }

  if ((data.education || []).some((e) => e.schoolName || e.degree)) {
    children.push(sectionHeading("Education", ACCENT));
    for (const edu of data.education) {
      if (!edu.schoolName && !edu.degree) continue;
      const line = [edu.degree, edu.schoolName].filter(Boolean).join(" — ");
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [new TextRun({ text: line, bold: true, size: SZ.body, color: INK })],
        })
      );
      if (dates) {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: dates, size: SZ.meta, color: MUTED, italics: true })],
          })
        );
      }
    }
  }

  const skillNames = toSkillList(data.skills)
    .filter((s) => s.name)
    .map((s) => s.name);
  if (skillNames.length) {
    children.push(sectionHeading("Skills", ACCENT));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: skillNames.join(" • "), size: SZ.body, color: INK })],
      })
    );
  }

  for (const section of data.extras || []) {
    if (!extraSectionHasContent(section)) continue;
    children.push(
      sectionHeading(
        section.id === 5 ? "Languages" : section.title || "Additional",
        ACCENT,
      ),
    );
    for (const item of section.data || []) {
      if (!extraItemHasContent(section.id, item)) continue;
      const lines = extraItemLines(section.id, item);
      lines.forEach((line, index) => {
        children.push(
          new Paragraph({
            spacing: { after: index === lines.length - 1 ? 80 : 20 },
            bullet: index === 0 ? { level: 0 } : undefined,
            indent: index > 0 ? { left: 360 } : undefined,
            children: [
              new TextRun({
                text: line,
                size: index === 0 ? SZ.body : SZ.meta,
                color: index === 0 ? INK : MUTED,
              }),
            ],
          }),
        );
      });
    }
  }

  const doc = new Document({
    creator: name,
    title: `${name} — Resume`,
    styles: {
      default: {
        document: {
          run: { font: DOCX_FONTS[fontId] || "Arial", size: SZ.body, color: INK },
        },
      },
    },
    sections: [{ properties: {}, children }],
  });

  return Packer.toBlob(doc);
};

export const downloadDocx = async (blob, name = "resume") => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.docx`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
};