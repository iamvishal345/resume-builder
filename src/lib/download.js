/** Trigger a local file download from a Blob (client-only). */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the browser has a chance to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

/** Filesystem-safe basename (no extension). */
export const safeFilename = (name, fallback = "resume") =>
  String(name || fallback)
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64)
    .toLowerCase() || fallback;
