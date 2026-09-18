// Density helpers for "fit to one page".
export const DENSITY_PRESETS = {
  normal: {
    density: "normal",
    fontSize: 14,
    lineHeight: 1.5,
    sectionSpacing: 16,
  },
  compact: {
    density: "dense",
    fontSize: 12.5,
    lineHeight: 1.35,
    sectionSpacing: 10,
  },
  tight: {
    density: "dense",
    fontSize: 11.5,
    lineHeight: 1.28,
    sectionSpacing: 8,
  },
};

export const nextFitPreset = (settings = {}) => {
  const fs = Number(settings.fontSize) || 14;
  if (fs > 13) return DENSITY_PRESETS.compact;
  if (fs > 12) return DENSITY_PRESETS.tight;
  return DENSITY_PRESETS.tight;
};

export const resetFitPreset = () => DENSITY_PRESETS.normal;
