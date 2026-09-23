// Render the real exported PDF (same pipeline as the download button) into
// canvases — one per page — so the on-screen preview paginates exactly like
// the file a user downloads. All heavy modules load lazily so the editor and
// dashboard bundles stay lean.

let pdfjsPromise = null;

const getPdfjs = () => {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((module) => {
      module.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return module;
    });
  }
  return pdfjsPromise;
};

/**
 * Build the resume PDF (via buildResumePdf) and rasterize each page to a
 * canvas. Returns `{ pages, numPages }` where `pages` is an array of canvases
 * in document order.
 */
export const renderResumePdfPreview = async ({
  data,
  templateId,
  paletteId,
  fontId,
  settings,
}) => {
  const [{ buildResumePdf }, pdfjs] = await Promise.all([
    import("./index"),
    getPdfjs(),
  ]);

  const blob = await buildResumePdf({ data, templateId, paletteId, fontId, settings });
  const buffer = await blob.arrayBuffer();
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
  }).promise;

  try {
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const scale = dpr * 1.5;
    const pages = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
      pages.push(canvas);
      page.cleanup();
    }
    return { pages, numPages: pages.length, blob };
  } finally {
    await doc.loadingTask.destroy();
  }
};