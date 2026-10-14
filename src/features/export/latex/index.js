import { downloadBlob, safeFilename } from "@lib/download";
import { buildCompactLatex } from "./compact.js";
import { buildResumeLatex } from "./classic.js";
import {
  buildCoverLetterLatex,
  downloadCoverLetterLatex,
} from "./letter.js";
import { displayName } from "./model.js";
import { latexTemplateIdOf } from "./templates.js";

export { buildResumeLatex, buildCompactLatex };
export { buildCoverLetterLatex, downloadCoverLetterLatex };
export { latexTemplateIdOf };

/**
 * The .tex file for the selected template, always generated from the resume.
 * A previously saved `latexSource` string is ignored so template choice and
 * download follow the form.
 */
export const latexDocumentOf = (data = {}) =>
  latexTemplateIdOf(data) === "compact"
    ? buildCompactLatex(data)
    : buildResumeLatex(data);

export const downloadResumeLatex = (data, filename) => {
  const tex = latexDocumentOf(data);
  const name = safeFilename(filename || displayName(data));
  downloadBlob(
    new Blob([tex], { type: "application/x-tex;charset=utf-8" }),
    `${name}.tex`,
  );
};
