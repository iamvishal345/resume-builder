// Device-local theme presets (palette + typography + structure — not content).
import { openDb, requestResult } from "./db";

const STORE = "themes";

const clone = (data) =>
  typeof structuredClone === "function"
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data));

/** Keys that define a reusable theme (exclude content/order). */
export const THEME_KEYS = [
  "templateId",
  "paletteId",
  "fontId",
  "layoutId",
  "headerAlign",
  "headerStyle",
  "skillStyle",
  "languageStyle",
  "experienceStyle",
  "sidebarTone",
  "density",
  "fontSize",
  "lineHeight",
  "sectionSpacing",
  "pagePadX",
  "pagePadY",
  "colGap",
  "nameSize",
  "photoSize",
  "radiusSm",
  "sidebarWidth",
  "primaryColor",
  "bgColor",
  "textColor",
  "showPhoto",
  "docxLayout",
  "sectionStyles",
  "sectionCols",
];

export const themeFromSettings = (settings = {}) => {
  const out = {};
  for (const key of THEME_KEYS) {
    if (settings[key] !== undefined) out[key] = clone(settings[key]);
  }
  return out;
};

export const listThemes = async () => {
  const db = await openDb();
  if (!db.objectStoreNames.contains(STORE)) return [];
  const tx = db.transaction(STORE, "readonly");
  const all = await requestResult(tx.objectStore(STORE).getAll());
  return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};

export const saveTheme = async (name, settings) => {
  const db = await openDb();
  if (!db.objectStoreNames.contains(STORE)) {
    throw new Error("Theme store not available — reload the app once.");
  }
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `theme-${Date.now()}`;
  const entry = {
    id,
    name: (name || "My theme").trim() || "My theme",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: themeFromSettings(settings),
  };
  const tx = db.transaction(STORE, "readwrite");
  await requestResult(tx.objectStore(STORE).put(entry));
  return entry;
};

export const deleteTheme = async (id) => {
  const db = await openDb();
  if (!db.objectStoreNames.contains(STORE)) return;
  const tx = db.transaction(STORE, "readwrite");
  await requestResult(tx.objectStore(STORE).delete(id));
};
