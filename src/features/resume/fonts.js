export const RESUME_FONTS = [
  {
    id: "sans",
    name: "Modern Sans",
    stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  {
    id: "grotesk",
    name: "Grotesk",
    stack: "'Space Grotesk', 'Segoe UI', Roboto, -apple-system, Arial, sans-serif",
  },
  {
    id: "serif",
    name: "Classic Serif",
    stack: "Georgia, 'Times New Roman', Times, serif",
  },
  {
    id: "elegant",
    name: "Elegant",
    stack: "'Lora', Georgia, 'Palatino Linotype', 'Book Antiqua', serif",
  },
  {
    id: "display",
    name: "Display",
    stack: "'Playfair Display', Georgia, 'Times New Roman', Times, serif",
  },
  {
    id: "slab",
    name: "Slab",
    stack: "'Roboto Slab', Georgia, 'Trebuchet MS', serif",
  },
];

export const getFont = (id) =>
  RESUME_FONTS.find((f) => f.id === id) ?? RESUME_FONTS[0];