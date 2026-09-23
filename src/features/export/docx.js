// Client-side DOCX export — ATS single-column by default.
// settings.docxLayout === "preview" uses a borderless 2-column table for
// sidebar / split layouts (best-effort visual match; Word will not reflow a
// full-bleed sidebar across pages).
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { buildResumeStyle } from "@features/resume/style";
import { toSkillList } from "@features/resume/skillList";
import {
  extraItemHasContent,
  extraItemLines,
  extraSectionHasContent,
} from "@features/resume/extraContent";
import {
  availableSections,
  columnsSplit,
  columnsWithSide,
  effectiveOrder,
  findExtraByRef,
  catalogKindOf,
  titleOf,
} from "@features/resume/order";
import { downloadBlob, safeFilename } from "@lib/download";

const DOCX_FONTS = {
  sans: "Arial",
  grotesk: "Calibri",
  serif: "Georgia",
  elegant: "Palatino Linotype",
  display: "Trebuchet MS",
  slab: "Courier New",
};

const SZ = { body: 22, name: 44, title: 24, section: 22, meta: 20 }; // half-points
const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const inlineText = (node) => {
  if (!node) return "";
  if (node.nodeType === 3) return node.textContent || "";
  if (node.nodeName === "BR") return " ";
  return [...node.childNodes].map(inlineText).join("");
};

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
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: SZ.section,
        color: accent,
      }),
    ],
  });

const richParagraphs = (html, ink) => {
  const runs = htmlToRuns(html);
  return runs.map(
    (r) =>
      new Paragraph({
        spacing: { after: 80 },
        bullet: r.bullet ? { level: 0 } : undefined,
        children: [new TextRun({ text: r.text, size: SZ.body, color: ink })],
      }),
  );
};

const headerParas = (data, ACCENT, MUTED) => {
  const pd = data.pd || {};
  const name =
    [pd.firstName, pd.lastName].filter(Boolean).join(" ") || "Your Name";
  const contact = [
    pd.email,
    pd.contactNumber,
    [pd.city, pd.state, pd.country].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("  |  ");
  const out = [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: name, bold: true, size: SZ.name, color: ACCENT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: pd.designation || "Job Title",
          size: SZ.title,
          color: MUTED,
        }),
      ],
    }),
  ];
  if (contact) {
    out.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({ text: contact, size: SZ.meta, color: MUTED }),
        ],
      }),
    );
  }
  return out;
};

const sectionParas = (id, data, ACCENT, INK, MUTED) => {
  const out = [];
  if (id === "summary") {
    if (!data.summary) return out;
    out.push(sectionHeading("Summary", ACCENT));
    out.push(...richParagraphs(data.summary, INK));
    return out;
  }
  if (id === "experience") {
    const items = (data.experience || []).filter(
      (e) => e.positionTitle || e.companyName,
    );
    if (!items.length) return out;
    out.push(sectionHeading("Experience", ACCENT));
    for (const e of items) {
      const line = [e.positionTitle, e.companyName ? ` — ${e.companyName}` : ""].join(
        "",
      );
      const dates = [e.startDate, e.endDate].filter(Boolean).join(" – ");
      out.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: line, bold: true, size: SZ.body, color: INK }),
          ],
        }),
      );
      if (dates) {
        out.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: dates,
                size: SZ.meta,
                color: MUTED,
                italics: true,
              }),
            ],
          }),
        );
      }
      if (e.workSummary) out.push(...richParagraphs(e.workSummary, INK));
    }
    return out;
  }
  if (id === "education") {
    const items = (data.education || []).filter(
      (e) => e.schoolName || e.degree,
    );
    if (!items.length) return out;
    out.push(sectionHeading("Education", ACCENT));
    for (const edu of items) {
      const line = [edu.degree, edu.schoolName].filter(Boolean).join(" — ");
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
      out.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: line, bold: true, size: SZ.body, color: INK }),
          ],
        }),
      );
      if (dates) {
        out.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: dates,
                size: SZ.meta,
                color: MUTED,
                italics: true,
              }),
            ],
          }),
        );
      }
    }
    return out;
  }
  if (id === "skills") {
    const skillNames = toSkillList(data.skills)
      .filter((s) => s.name)
      .map((s) => s.name);
    if (!skillNames.length) return out;
    out.push(sectionHeading("Skills", ACCENT));
    out.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: skillNames.join(" • "),
            size: SZ.body,
            color: INK,
          }),
        ],
      }),
    );
    return out;
  }
  if (typeof id === "string" && id.startsWith("extra:")) {
    const section = findExtraByRef(data.extras || [], id);
    if (!section || !extraSectionHasContent(section)) return out;
    const kind = catalogKindOf(section);
    out.push(
      sectionHeading(
        kind === 5
          ? "Languages"
          : section.title || titleOf(id, []) || "Additional",
        ACCENT,
      ),
    );
    for (const item of section.data || []) {
      if (!extraItemHasContent(kind, item)) continue;
      const lines = extraItemLines(kind, item);
      lines.forEach((line, index) => {
        out.push(
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
  return out;
};

const columnParas = (ids, data, ACCENT, INK, MUTED) => {
  const out = [];
  for (const id of ids) {
    out.push(...sectionParas(id, data, ACCENT, INK, MUTED));
  }
  if (!out.length) {
    out.push(new Paragraph({ children: [new TextRun({ text: " ", size: SZ.body })] }));
  }
  return out;
};

const twoColumnTable = (leftIds, rightIds, data, colors, leftPct) => {
  const { ACCENT, INK, MUTED } = colors;
  const leftW = Math.round(9000 * (leftPct / 100));
  const rightW = 9000 - leftW;
  const cell = (ids, width) =>
    new TableCell({
      borders: NO_BORDER,
      width: { size: width, type: WidthType.DXA },
      children: columnParas(ids, data, ACCENT, INK, MUTED),
    });
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [leftW, rightW],
    rows: [
      new TableRow({
        children: [cell(leftIds, leftW), cell(rightIds, rightW)],
      }),
    ],
  });
};

const buildAtsChildren = (data, colors) => {
  const { ACCENT, INK, MUTED } = colors;
  const available = availableSections(data);
  const order = effectiveOrder([], available.map((s) => s.id), data);
  const children = [...headerParas(data, ACCENT, MUTED)];
  for (const id of order) {
    children.push(...sectionParas(id, data, ACCENT, INK, MUTED));
  }
  return children;
};

const buildPreviewChildren = (data, settings, colors) => {
  const { ACCENT, INK, MUTED } = colors;
  const layoutId = settings?.layoutId || "single";
  const available = availableSections(data);
  const order = effectiveOrder(
    settings?.sectionOrder,
    available.map((s) => s.id),
    data,
  );
  const children = [...headerParas(data, ACCENT, MUTED)];

  if (layoutId === "sidebar" || layoutId === "sidebar-right") {
    const [side, main] = columnsWithSide(
      order,
      settings?.sectionCols || {},
      data.extras || [],
    );
    const width = Math.min(46, Math.max(20, settings?.sidebarWidth ?? 32));
    if (layoutId === "sidebar-right") {
      children.push(twoColumnTable(main, side, data, colors, 100 - width));
    } else {
      children.push(twoColumnTable(side, main, data, colors, width));
    }
    return children;
  }

  if (layoutId === "split") {
    const [left, right] = columnsSplit(order, settings?.sectionCols || {});
    children.push(twoColumnTable(left, right, data, colors, 50));
    return children;
  }

  for (const id of order) {
    children.push(...sectionParas(id, data, ACCENT, INK, MUTED));
  }
  return children;
};

export const buildResumeDocx = async (data, { palette, fontId, settings }) => {
  const vars = buildResumeStyle({
    palette,
    font: { stack: DOCX_FONTS[fontId] || "Arial" },
    settings,
  });
  const toHex = (c) =>
    /^#[0-9a-fA-F]{6}$/.test(c) ? c.slice(1) : String(c || "").replace("#", "");
  const colors = {
    ACCENT: toHex(vars["--r-accent"]),
    INK: toHex(vars["--r-ink"]),
    MUTED: toHex(vars["--r-muted"]),
  };

  const pd = data.pd || {};
  const name =
    [pd.firstName, pd.lastName].filter(Boolean).join(" ") || "Your Name";

  const preview = (settings?.docxLayout || "ats") === "preview";
  const children = preview
    ? buildPreviewChildren(data, settings, colors)
    : buildAtsChildren(data, colors);

  const doc = new Document({
    creator: name,
    title: `${name} — Resume`,
    styles: {
      default: {
        document: {
          run: {
            font: DOCX_FONTS[fontId] || "Arial",
            size: SZ.body,
            color: colors.INK,
          },
        },
      },
    },
    sections: [{ properties: {}, children }],
  });

  return Packer.toBlob(doc);
};

export const downloadDocx = async (blob, name = "resume") => {
  downloadBlob(blob, `${safeFilename(name)}.docx`);
};
