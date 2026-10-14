export const MODE_TO_ACTIVE_TAB = {
  editor: "resume-editor",
  preview: "resume-preview",
  letter: "cover-latter",
  latex: "resume-latex",
};

export const parseActiveTabParam = (params) => {
  if (!params) return null;
  const activeTab = typeof params.get === "function" ? params.get("activeTab") : params.activeTab;
  if (activeTab) {
    const norm = String(activeTab).toLowerCase();
    if (norm === "resume-preview" || norm === "preview") return "preview";
    if (norm === "cover-latter" || norm === "cover-letter" || norm === "letter")
      return "letter";
    if (norm === "resume-editor" || norm === "editor") return "editor";
    if (norm === "resume-latex" || norm === "latex" || norm === "tex")
      return "latex";
  }
  const view = typeof params.get === "function" ? params.get("view") : params.view;
  if (view) {
    const norm = String(view).toLowerCase();
    if (norm === "preview") return "preview";
    if (norm === "letter" || norm === "cover-letter" || norm === "cover-latter")
      return "letter";
    if (norm === "editor") return "editor";
    if (norm === "latex" || norm === "tex") return "latex";
  }
  return null;
};

/** True when the editor should open the existing import dialog (`?import=1`). */
export const parseImportParam = (params) => {
  if (!params) return false;
  const raw = typeof params.get === "function" ? params.get("import") : params.import;
  return String(raw ?? "") === "1";
};
