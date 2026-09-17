export const RESUME_PALETTES = [
  { id: "slate", name: "Slate", accent: "#0F172A", accentSoft: "#3F4F65", accentInk: "#FFFFFF", ink: "#111827", muted: "#5B6672", rule: "#D8DEE5", surface: "#F1F5F9" },
  { id: "navy", name: "Navy", accent: "#1E3A8A", accentSoft: "#4271CF", accentInk: "#FFFFFF", ink: "#14203B", muted: "#5A6478", rule: "#D6DEEB", surface: "#EEF2FA" },
  { id: "emerald", name: "Emerald", accent: "#065F46", accentSoft: "#14B881", accentInk: "#FFFFFF", ink: "#10241D", muted: "#4F625B", rule: "#D4E3DC", surface: "#EEF7F2" },
  { id: "olive", name: "Olive", accent: "#3E481D", accentSoft: "#6F7C46", accentInk: "#FFFFFF", ink: "#23261B", muted: "#5D624F", rule: "#DDE1D2", surface: "#F3F5EC" },
  { id: "teal", name: "Teal", accent: "#0F766E", accentSoft: "#14B8A6", accentInk: "#FFFFFF", ink: "#0F2524", muted: "#4E605E", rule: "#D2E3E2", surface: "#ECF6F5" },
  { id: "indigo", name: "Indigo", accent: "#4338CA", accentSoft: "#6C6FF2", accentInk: "#FFFFFF", ink: "#1A1840", muted: "#5A5B7A", rule: "#D9D8F0", surface: "#F0EFFB" },
  { id: "burgundy", name: "Burgundy", accent: "#7F1D1D", accentSoft: "#B34A4A", accentInk: "#FFFFFF", ink: "#2B1418", muted: "#65494E", rule: "#E3D3D6", surface: "#F7EEEF" },
  { id: "terracotta", name: "Terracotta", accent: "#9A3412", accentSoft: "#EA7A3D", accentInk: "#FFFFFF", ink: "#2A1A13", muted: "#665248", rule: "#E8DCD5", surface: "#F9F2EE" },
  { id: "gold", name: "Gold", accent: "#92400E", accentSoft: "#D89B32", accentInk: "#2A1B08", ink: "#241C10", muted: "#655B4C", rule: "#E8DECB", surface: "#F8F3E9" },
  { id: "rose", name: "Rose", accent: "#9D174D", accentSoft: "#F15A9C", accentInk: "#FFFFFF", ink: "#2B1520", muted: "#674C56", rule: "#E7D3DC", surface: "#F8EEF3" },
];

export const getPalette = (id) =>
  RESUME_PALETTES.find((p) => p.id === id) ?? RESUME_PALETTES[0];