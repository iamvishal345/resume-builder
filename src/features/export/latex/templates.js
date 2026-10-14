/** Single-column ATS-plain LaTeX resume templates. Classic is the default. */
export const LATEX_TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
  },
  {
    id: "compact",
    name: "Compact",
  },
];

export const latexTemplateIdOf = (data = {}) => {
  const id = data?.resumeSettings?.latexTemplateId;
  return LATEX_TEMPLATES.some((template) => template.id === id) ? id : "classic";
};
