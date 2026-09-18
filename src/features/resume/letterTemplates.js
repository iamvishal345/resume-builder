/** Letter visual presets — reuse resume palette/font for cohesion. */
export const LETTER_TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Left-aligned, accent rule under the name",
    headerAlign: "left",
  },
  {
    id: "centered",
    name: "Centered",
    description: "Centered header block",
    headerAlign: "center",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Name only, soft meta line",
    headerAlign: "left",
  },
];

export const applyLetterTemplate = (settings, templateId) => {
  const t = LETTER_TEMPLATES.find((x) => x.id === templateId) || LETTER_TEMPLATES[0];
  return {
    ...settings,
    letterTemplateId: t.id,
    letterHeaderAlign: t.headerAlign,
  };
};
