// Cavren classic: one single-column article-class file from resume JSON.
import { escapeLatex } from "./escape.js";
import {
  collectResumeLatex,
  formatLatexDate,
  renderProseBlocks,
} from "./model.js";

export { formatLatexDate };

const PREAMBLE = `\\documentclass[11pt]{article}

% Cavren classic — single column, pdfLaTeX.
% Packages below are in the in-browser TeX Live bundles.

\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.7in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\itemsep}{0pt}
\\setlength{\\parsep}{0pt}
\\setlength{\\topsep}{0.25em}
\\setlength{\\leftmargini}{1.25em}
\\newcommand{\\cvsection}[1]{%
  \\par\\vspace{1em}{\\large\\bfseries #1}\\par\\vspace{0.25em}\\hrule\\vspace{0.55em}%
}
`;

const classicEntry = (entry) => {
  const lines = [];
  const head = escapeLatex(entry.primary || "");
  const when = entry.dates ? escapeLatex(entry.dates) : "";
  if (head || when) {
    lines.push(
      `\\noindent\\textbf{${head}}${when ? `\\hfill ${when}` : ""}\\par`,
    );
  }
  if (entry.secondary) lines.push(`\\textit{${escapeLatex(entry.secondary)}}\\par`);
  const body = renderProseBlocks(entry.blocks);
  if (body) lines.push(body);
  lines.push("\\vspace{0.6em}");
  return lines.join("\n");
};

export const buildResumeLatex = (data = {}) => {
  const model = collectResumeLatex(data);
  const body = [];

  if (model.name) body.push(`{\\LARGE\\bfseries ${escapeLatex(model.name)}}\\par`);
  if (model.designation) {
    body.push(`{\\large ${escapeLatex(model.designation)}}\\par`);
  }
  if (model.contactParts.length) {
    body.push(
      `${model.contactParts.map((part) => escapeLatex(part)).join(" \\textperiodcentered\\ ")}\\par`,
    );
  }

  for (const section of model.sections) {
    const title = escapeLatex(section.title);
    if (section.type === "prose") {
      const summary = renderProseBlocks(section.blocks);
      if (!summary) continue;
      body.push(`\\cvsection{${title}}`, summary);
      continue;
    }
    if (section.type === "entries") {
      body.push(`\\cvsection{${title}}`);
      for (const entry of section.entries) body.push(classicEntry(entry));
      continue;
    }
    if (section.type === "skills") {
      body.push(
        `\\cvsection{${title}}`,
        `${section.names.map((skill) => escapeLatex(skill)).join(", ")}\\par`,
      );
      continue;
    }
    if (section.type === "lines") {
      body.push(
        `\\cvsection{${title}}`,
        [
          "\\begin{itemize}",
          ...section.lines.map((line) => `  \\item ${escapeLatex(line)}`),
          "\\end{itemize}",
        ].join("\n"),
      );
    }
  }

  // An empty body makes pdfTeX exit 0 with no PDF. Ship a blank page.
  const pages = body.length ? body.join("\n\n") : "\\null";
  return `${PREAMBLE}\n\\begin{document}\n${pages}\n\\end{document}\n`;
};
