// Programmatic PDF export built on @react-pdf/renderer. All heavy modules are
// imported lazily on first download so the editor/dashboard bundles stay lean.
// This replaces the previous window.print()-based export (printNode).

const sanitizeFileName = (name) =>
  String(name)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "document";

const triggerDownload = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
};

export const buildResumePdf = async ({
  data,
  templateId = "classic",
  paletteId,
  fontId = "sans",
  settings = {},
}) => {
  const [{ pdf }, { default: PdfResume }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./pdf-resume"),
  ]);
  const doc = pdf(
    <PdfResume
      data={data || {}}
      templateId={templateId}
      paletteId={paletteId}
      fontId={fontId}
      settings={settings}
    />
  );
  return doc.toBlob();
};

export const downloadResumePdf = async ({
  data,
  templateId = "classic",
  paletteId,
  fontId = "sans",
  settings = {},
  fileName,
}) => {
  const blob = await buildResumePdf({
    data,
    templateId,
    paletteId,
    fontId,
    settings,
  });
  const name =
    fileName ||
    sanitizeFileName(
      `${data?.pd?.firstName || ""}-${data?.pd?.lastName || ""}-Resume`
    );
  triggerDownload(blob, `${name}.pdf`);
};

export const downloadCoverLetterPdf = async ({
  personalDetails = {},
  socialLinks = [],
  coverLetter = { recipient: "", body: "" },
  fontId = "sans",
  fileName,
}) => {
  const [{ pdf }, { default: PdfLetter }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./pdf-letter"),
  ]);
  const doc = pdf(
    <PdfLetter
      personalDetails={personalDetails}
      socialLinks={socialLinks}
      coverLetter={coverLetter}
      fontId={fontId}
    />
  );
  const blob = await doc.toBlob();
  const name =
    fileName ||
    sanitizeFileName(
      `${personalDetails.firstName || ""}-${personalDetails.lastName || ""}-Cover-Letter`
    );
  triggerDownload(blob, `${name}.pdf`);
};

export const resumePdfFileName = (data, fallback = "resume") =>
  sanitizeFileName(
    `${data?.pd?.firstName || ""}-${data?.pd?.lastName || ""}-Resume`
  ) || fallback;