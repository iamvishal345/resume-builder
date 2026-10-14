// Generate a resume .tex file and compile it to PDF on the device.
// `compile` is injected in tests so vitest never loads the wasm engine.

import { downloadBlob, safeFilename } from "@lib/download";
import { latexDocumentOf, latexTemplateIdOf } from "./index.js";
import { displayName, latexIsBlank } from "./model.js";

export const LATEX_ENGINE = "pdflatex";

/** Thrown when the form has nothing for pdfLaTeX to place on the page. */
export const latexBlankError = () => {
  const error = new Error("Add a name and a job on Edit to fill this page");
  error.code = "latex-blank";
  return error;
};

export const isLatexBlankError = (error) => error?.code === "latex-blank";

/** Job the compiler receives. Always generated from the form. */
export const latexJobOf = (data = {}) => {
  const resumeSettings = data.resumeSettings || data.settings || {};
  const normalized = { ...data, resumeSettings };
  return {
    templateId: latexTemplateIdOf(normalized),
    engine: LATEX_ENGINE,
    source: latexDocumentOf(normalized),
  };
};

const firstTexError = (log = "") => {
  const line = String(log)
    .split(/\r?\n/)
    .map((row) => row.trim())
    .find((row) => row.startsWith("!"));
  return line ? line.replace(/^!\s*/, "").slice(0, 280) : "";
};

/** A short message for the editor. The raw log stays available to the caller. */
export const plainLatexFailure = (error, log = "") => {
  const raw =
    error && typeof error === "object" && "message" in error
      ? String(error.message || "")
      : String(error || "");
  const fromLog = firstTexError(log) || firstTexError(raw);
  if (fromLog) return fromLog;
  if (/failed to fetch|network|load wasm|wasm load/i.test(raw)) {
    return "The TeX engine could not be downloaded. Your resume stayed on this device. Download the .tex file, or try again when you are online.";
  }
  if (/timeout/i.test(raw)) {
    return "Typesetting took too long and was stopped. Download the .tex file to compile it yourself, or try again.";
  }
  if (/worker init/i.test(raw)) {
    return "The TeX engine did not start. Download the .tex file, or try again.";
  }
  const brief = raw.replace(/^Error:\s*/i, "").trim().slice(0, 280);
  if (brief) return brief;
  return "LaTeX could not build that PDF. Download the .tex file and compile it with pdfLaTeX, or try again.";
};

const pdfBytesOf = (result) => {
  const bytes = result?.pdf;
  if (!result?.success || !bytes || !bytes.byteLength) return null;
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
};

/**
 * Generate .tex from the resume, then compile it.
 * Pass `compile` to stub the engine. The default engine is loaded only when omitted.
 */
export const compileResumeLatex = async (data, { compile, onProgress } = {}) => {
  if (latexIsBlank(data)) throw latexBlankError();
  const job = latexJobOf(data);
  const run =
    compile ||
    (async (input) => {
      const { compileWithSiglum } = await import("./siglumEngine.js");
      return compileWithSiglum(input, { onProgress });
    });
  let result;
  try {
    result = await run(job);
  } catch (error) {
    const wrapped = new Error(plainLatexFailure(error, error?.log));
    wrapped.log = error?.log || "";
    throw wrapped;
  }
  const pdf = pdfBytesOf(result);
  if (!pdf) {
    const wrapped = new Error(plainLatexFailure(result?.error, result?.log));
    wrapped.log = result?.log || "";
    throw wrapped;
  }
  return { ...job, pdf, log: result.log || "" };
};

export const downloadCompiledResumePdf = async ({
  data,
  fileName,
  onProgress,
} = {}) => {
  const result = await compileResumeLatex(data, { onProgress });
  const name = safeFilename(fileName || displayName(data) || "resume");
  downloadBlob(
    new Blob([result.pdf], { type: "application/pdf" }),
    `${name}.pdf`,
  );
  return result;
};
