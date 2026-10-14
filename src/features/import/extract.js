// Client-side text extraction for resume import: PDF (pdfjs-dist, lazy),
// DOCX (fflate + XML), and text/html/markdown pass-through.
// Everything runs in the browser — nothing is uploaded.

import { unzipSync, strFromU8 } from "fflate";
import { classifyPdfExtract, PDF_EXTRACT_MESSAGES } from "@features/import/pdfResume";

export const isJsonBackupFile = (file) => {
  const name = (file.name || "").toLowerCase();
  return /\.(?:json|r\.json)$/.test(name) || file.type === "application/json";
};

const fileText = async (file) => {
  if (typeof file.text === "function") return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Could not read file."));
    reader.readAsText(file);
  });
};

// ---------- PDF ----------

let pdfjsPromise = null;
const loadPdfjs = () => {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((module) => {
      module.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return module;
    });
  }
  return pdfjsPromise;
};

const pdfFailure = (code) => {
  const error = new Error(PDF_EXTRACT_MESSAGES[code] || PDF_EXTRACT_MESSAGES.unreadable);
  error.code = code;
  return error;
};

const isEncryptedPdfError = (error) => {
  const name = String(error?.name || "");
  const message = String(error?.message || "");
  return name === "PasswordException" || /password|encrypted/i.test(message);
};

const extractPdfText = async (file) => {
  const pdfjs = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  let pdf;
  try {
    const task = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    pdf = await task.promise;
    const parts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let line = "";
      for (const item of content.items) {
        if (typeof item.str !== "string") continue;
        line += item.str;
        if (item.hasEOL) {
          parts.push(line);
          line = "";
        }
      }
      if (line) parts.push(line);
    }
    const assessed = classifyPdfExtract({
      text: parts.join("\n"),
      pageCount: pdf.numPages,
    });
    if (!assessed.ok) throw pdfFailure(assessed.code);
    return assessed.text;
  } catch (error) {
    if (error?.code && PDF_EXTRACT_MESSAGES[error.code]) throw error;
    if (isEncryptedPdfError(error)) throw pdfFailure("encrypted");
    throw pdfFailure("unreadable");
  } finally {
    try {
      await pdf?.destroy();
    } catch {
      /* already closed */
    }
  }
};

// ---------- DOCX ----------

const extractDocxText = async (file) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const zip = unzipSync(bytes);
  const xmlText =
    zip["word/document.xml"] !== undefined
      ? strFromU8(zip["word/document.xml"])
      : null;
  if (!xmlText) throw new Error("This .docx has no readable body.");
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  const lines = [];
  for (const paragraph of doc.getElementsByTagName("w:p")) {
    const runs = [...paragraph.getElementsByTagName("w:t")];
    const text = runs.map((t) => t.textContent || "").join("");
    if (text.trim()) lines.push(text);
  }
  return lines.join("\n").trim();
};

// ---------- Entry ----------

export const extractTextFromFile = async (file) => {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  if (name.endsWith(".docx") || /word/i.test(file.type)) {
    try {
      return await extractDocxText(file);
    } catch (e) {
      throw new Error(`Could not read the .docx: ${e?.message || "unknown error"}`);
    }
  }
  const plain = await fileText(file);
  return plain.trim();
};