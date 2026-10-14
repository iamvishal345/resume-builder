// Cavren compact: single-column article file with a different type hierarchy
// from classic. Uppercase section labels, organization above the role, skills
// as a list. No sidebar, bars, chips, or photos.
import { escapeLatex } from "./escape.js";
import {
  collectResumeLatex,
  renderProseBlocks,
} from "./model.js";

const PREAMBLE = `\\documentclass[10pt]{article}

% Cavren compact — single column, uppercase section labels, pdfLaTeX.
% Packages below are in the in-browser TeX Live bundles.

\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\itemsep}{0.15em}
\\setlength{\\parsep}{0pt}
\\setlength{\\topsep}{0.2em}
\\setlength{\\leftmargini}{1.1em}
\\newcommand{\\cvsec}[1]{%
  \\par\\vspace{0.85em}{\\small\\bfseries\\MakeUppercase{#1}}\\par\\vspace{0.3em}%
}
`;

const compactEntry = (entry) => {
  const lines = [];
  const place = entry.secondary ? escapeLatex(entry.secondary) : "";
  const role = entry.primary ? escapeLatex(entry.primary) : "";
  const when = entry.dates ? escapeLatex(entry.dates) : "";
  if (place) lines.push(`\\noindent\\textbf{${place}}\\par`);
  const roleLine = [role, when ? `(${when})` : ""].filter(Boolean).join(" ");
  if (roleLine) lines.push(`${roleLine}\\par`);
  const body = renderProseBlocks(entry.blocks);
  if (body) lines.push(body);
  lines.push("\\vspace{0.35em}");
  return lines.join("\n");
};

export const buildCompactLatex = (data = {}) => {
  const model = collectResumeLatex(data);
  const body = [];
  if (model.name) body.push(`{\\Large\\bfseries ${escapeLatex(model.name)}}\\par`);
  if (model.designation) {
    body.push(`{\\itshape ${escapeLatex(model.designation)}}\\par`);
  }
  if (model.contactParts.length) {
    body.push(
      `${model.contactParts.map((part) => escapeLatex(part)).join(" \\textbar\\ ")}\\par`,
    );
  }

  for (const section of model.sections) {
    const title = escapeLatex(section.title);
    body.push(`\\cvsec{${title}}`);
    if (section.type === "prose") {
      const prose = renderProseBlocks(section.blocks);
      if (prose) body.push(prose);
      continue;
    }
    if (section.type === "entries") {
      for (const entry of section.entries) body.push(compactEntry(entry));
      continue;
    }
    if (section.type === "skills") {
      body.push(
        [
          "\\begin{itemize}",
          ...section.names.map((name) => `  \\item ${escapeLatex(name)}`),
          "\\end{itemize}",
        ].join("\n"),
      );
      continue;
    }
    if (section.type === "lines") {
      body.push(section.lines.map((line) => `${escapeLatex(line)}\\par`).join("\n"));
    }
  }

  const pages = body.length ? body.join("\n\n") : "\\null";
  return `${PREAMBLE}\n\\begin{document}\n${pages}\n\\end{document}\n`;
};
