export const MODE_TO_ACTIVE_TAB = {
  editor: "resume-editor",
  preview: "resume-preview",
  letter: "cover-latter",
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
  }
  const view = typeof params.get === "function" ? params.get("view") : params.view;
  if (view) {
    const norm = String(view).toLowerCase();
    if (norm === "preview") return "preview";
    if (norm === "letter" || norm === "cover-letter" || norm === "cover-latter")
      return "letter";
    if (norm === "editor") return "editor";
  }
  return null;
};
