// Cover letter .tex from the letter fields plus the applicant header.
import { downloadBlob, safeFilename } from "@lib/download";
import { escapeLatex } from "./escape.js";
import {
  contactParts,
  displayName,
  proseBlocks,
  renderProseBlocks,
} from "./model.js";

const PREAMBLE = `\\documentclass[11pt]{article}

% Cavren cover letter — single column.
% pdfLaTeX is enough for Latin text. XeLaTeX or LuaLaTeX also work.

\\usepackage{iftex}
\\ifPDFTeX
  \\usepackage[T1]{fontenc}
  \\usepackage[utf8]{inputenc}
\\else
  \\usepackage{fontspec}
\\fi
\\usepackage[margin=1in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.65em}
\\setlength{\\itemsep}{0pt}
\\setlength{\\parsep}{0pt}
\\setlength{\\topsep}{0.25em}
\\setlength{\\leftmargini}{1.25em}
`;

const recipientBlock = (value) => {
  const lines = String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => escapeLatex(line));
  if (!lines.length) return "";
  return `${lines.join("\\\\\n")}\\par`;
};

/** Always a complete article file, including when the letter is empty. */
export const buildCoverLetterLatex = (data = {}) => {
  const pd = data.personalDetails || data.pd || {};
  const letter = data.coverLetter || {};
  const name = displayName(data);
  const body = [];

  if (name) body.push(`{\\LARGE\\bfseries ${escapeLatex(name)}}\\par`);
  if (pd.designation) body.push(`{\\large ${escapeLatex(pd.designation)}}\\par`);
  const contact = contactParts(pd, data.socialLinks || []);
  if (contact.length) {
    body.push(
      `${contact.map((part) => escapeLatex(part)).join(" \\textperiodcentered\\ ")}\\par`,
    );
  }
  const recipient = recipientBlock(letter.recipient);
  if (recipient) body.push(recipient);
  const prose = renderProseBlocks(proseBlocks(letter.body || ""));
  if (prose) body.push(prose);

  return `${PREAMBLE}\n\\begin{document}\n${body.join("\n\n")}\n\\end{document}\n`;
};

export const downloadCoverLetterLatex = (data, filename) => {
  const tex = buildCoverLetterLatex(data);
  const base = displayName(data);
  const name = safeFilename(filename || (base ? `${base}-letter` : "letter"));
  downloadBlob(
    new Blob([tex], { type: "application/x-tex;charset=utf-8" }),
    `${name}.tex`,
  );
};
