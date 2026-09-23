// Cover letter DOCX — simple single-column letter matching resume accent.
import { Document, Packer, Paragraph, TextRun } from "docx";
import { buildResumeStyle } from "@features/resume/style";

const clean = (html) =>
  (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const buildCoverLetterDocx = (view, letter) => {
  const settings = view?.settings || {};
  const fallbackPalette = {
    accent: settings.primaryColor || "#2e5c38",
    accentSoft: "#e9efe6",
    accentInk: "#ffffff",
    ink: "#111827",
    muted: "#5b6672",
    rule: "#d8dee5",
    surface: "#f1f5f9",
  };
  const style = buildResumeStyle({
    palette: fallbackPalette,
    font: { stack: "Arial, Helvetica, sans-serif" },
    settings,
  });
  const accent = (style["--r-accent"] || "#2e5c38").replace("#", "");
  const pd = view?.pd || {};
  const name = [pd.firstName, pd.lastName].filter(Boolean).join(" ") || "Applicant";
  const contact = [pd.email, pd.contactNumber, pd.city].filter(Boolean).join(" · ");
  const body = clean(letter?.body || "");
  const paras = body
    .split(/\n+/)
    .filter(Boolean)
    .map(
      (line) =>
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({ text: line, size: 22 })],
        }),
    );

  const children = [
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: name, bold: true, size: 32, color: accent }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: {
        bottom: { style: "single", size: 12, color: accent, space: 4 },
      },
      children: [new TextRun({ text: contact, size: 18, color: "666666" })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          size: 20,
        }),
      ],
    }),
  ];

  if (letter?.recipient) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: letter.recipient, size: 20 })],
      }),
    );
  }

  children.push(...paras);
  children.push(
    new Paragraph({
      spacing: { before: 240 },
      children: [new TextRun({ text: "Sincerely,", size: 22 })],
    }),
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({ text: name, bold: true, size: 22 })],
    }),
  );

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children,
      },
    ],
  });
};

export const downloadCoverLetterDocx = async (view, letter, filename) => {
  const doc = buildCoverLetterDocx(view, letter);
  const blob = await Packer.toBlob(doc);
  const { triggerDownload } = await import("@features/resumes/backup");
  const name =
    filename ||
    `${[view?.pd?.firstName, view?.pd?.lastName].filter(Boolean).join("-") || "cover"}-letter.docx`;
  triggerDownload(blob, name);
};
