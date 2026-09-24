/** Printable page formats for preview + PDF. */

export const PAPER_OPTIONS = [
  {
    id: "a4",
    name: "A4",
    pdf: "A4",
    widthMm: 210,
    heightMm: 297,
  },
  {
    id: "letter",
    name: "US Letter",
    pdf: "LETTER",
    widthMm: 215.9,
    heightMm: 279.4,
  },
];

export const resolvePaper = (id) =>
  PAPER_OPTIONS.find((p) => p.id === id) || PAPER_OPTIONS[0];

export const paperCssVars = (id) => {
  const p = resolvePaper(id);
  return {
    "--r-page-width": `${p.widthMm}mm`,
    "--r-page-height": `${p.heightMm}mm`,
  };
};
