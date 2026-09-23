import { downloadBlob, safeFilename } from "@lib/download";

/**
 * Extract a single page from a multi-page PDF blob (0-based index).
 * Uses pdf-lib loaded lazily so the editor bundle stays lean.
 */
export const extractPdfPage = async (pdfBlob, pageIndex = 0) => {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = await pdfBlob.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const count = src.getPageCount();
  const i = Math.max(0, Math.min(count - 1, Number(pageIndex) || 0));
  const out = await PDFDocument.create();
  const [page] = await out.copyPages(src, [i]);
  out.addPage(page);
  const saved = await out.save();
  return new Blob([saved], { type: "application/pdf" });
};

export const downloadPdfPage = async (pdfBlob, pageIndex, fileName = "resume") => {
  const pageBlob = await extractPdfPage(pdfBlob, pageIndex);
  const base = safeFilename(fileName);
  downloadBlob(pageBlob, `${base}-page-${pageIndex + 1}.pdf`);
};
