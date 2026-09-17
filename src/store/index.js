import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const HISTORY_LIMIT = 60;
const RECORD_DELAY = 550;
const SAVED_AT_KEY = "resume-data-saved-at";

// Content slices that participate in undo/redo snapshots.
const CONTENT_KEYS = [
  "personalDetails",
  "socialLinks",
  "workHistory",
  "education",
  "skills",
  "resumeSummary",
  "additionalSections",
  "resumeSettings",
  "coverLetter",
];

const snapshot = (state) => {
  const out = {};
  for (const key of CONTENT_KEYS) {
    try {
      out[key] = JSON.parse(JSON.stringify(state[key]));
    } catch {
      out[key] = undefined;
    }
  }
  return out;
};

const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Adds undo/redo across the whole resume store. Changes are coalesced into a
// single undo step after a quiet period, so a burst of keystrokes reverts in
// one press. Persist rehydration never records an undo step.
const withHistory = (config) => (set, get, api) => {
  let past = [];
  let future = [];
  let last = null;
  let pendingBefore = null;
  let timer = null;

  const setHistoryFlags = (canUndo, canRedo) =>
    set({ history: { canUndo, canRedo } }, false);

  const flush = () => {
    timer = null;
    const current = snapshot(get());
    if (last === null) {
      last = pendingBefore ?? current;
    }
    if (!isEqual(last, current)) {
      past.push(last);
      if (past.length > HISTORY_LIMIT) past.shift();
      future = [];
      last = current;
      setHistoryFlags(true, false);
    }
    pendingBefore = null;
  };

  const schedule = (before) => {
    if (pendingBefore === null) pendingBefore = before;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, RECORD_DELAY);
  };

  const wrappedSet = (partial, replace) => {
    if (!timer) schedule(snapshot(get()));
    return set(partial, replace);
  };

  const undo = () => {
    if (!past.length) return;
    future.push(last);
    last = past.pop();
    set({ ...last }, false);
    setHistoryFlags(past.length > 0, true);
  };

  const redo = () => {
    if (!future.length) return;
    past.push(last);
    last = future.pop();
    set({ ...last }, false);
    setHistoryFlags(true, future.length > 0);
  };

  const clearHistory = () => {
    past = [];
    future = [];
    last = null;
    pendingBefore = null;
    setHistoryFlags(false, false);
  };

  const base = config(wrappedSet, get, api);
  return { ...base, undo, redo, clearHistory };
};

// Stamp the last-save time into a side channel so a fresh page load can show
// a "draft recovered" banner. Kept outside the persisted state so saving time
// itself never creates undo entries or loops.
const stampSavedAt = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_AT_KEY, String(Date.now()));
};

export const DEFAULT_RESUME_SETTINGS = {
  templateId: "atlas",
  paletteId: "slate",
  fontId: "sans",
  layoutId: "single",
  headerStyle: "normal",
  density: "normal",
  primaryColor: "",
  bgColor: "",
  textColor: "",
  fontSize: 14,
  lineHeight: 1.5,
  sectionSpacing: 16,
  sectionOrder: [],
};

export const defaultResumeData = () => ({
  personalDetails: {},
  socialLinks: [],
  workHistory: [],
  education: [],
  skills: [],
  resumeSummary: "",
  additionalSections: [],
  resumeSettings: { ...DEFAULT_RESUME_SETTINGS },
  coverLetter: { recipient: "", body: "" },
});

// Snapshot the current content the way it should be stored for a resume
// document (content slices only — never history bookkeeping).
export const resumeDataOf = (state) => {
  const out = {};
  for (const key of CONTENT_KEYS) {
    out[key] = state?.[key] ?? defaultResumeData()[key];
  }
  return out;
};

export const useStore = create(
  persist(
    withHistory((set, get) => ({
      // Personal Details
      personalDetails: {},
      socialLinks: [],
      setPersonalDetails: (key, value) =>
        set(
          () => ({
            personalDetails: { ...get().personalDetails, [key]: value },
          }),
          false
        ),
      replacePersonalDetails: (pd) =>
        set(() => ({ personalDetails: { ...pd } }), false),
      setSocialLinks: (value) => set(() => ({ socialLinks: value }), false),
      removeSocialLinks: (value) =>
        set(
          () => ({
            socialLinks: get().socialLinks.filter(
              (item) => item.descriptionKey !== value.descriptionKey
            ),
          }),
          false
        ),
      reset: () => set({ personalDetails: {}, socialLinks: [] }, false),

      // Work Experience
      workHistory: [],
      setWorkHistory: (value) => set(() => ({ workHistory: value }), false),

      // Education
      education: [],
      setEducation: (value) => set(() => ({ education: value }), false),

      // Skills
      skills: [],
      setSkills: (value) => set(() => ({ skills: value }), false),

      // Summary
      resumeSummary: "",
      setResumeSummary: (value) => set(() => ({ resumeSummary: value }), false),

      // Additional Sections
      additionalSections: [],
      setAdditionalSections: (value) =>
        set(() => ({ additionalSections: value }), false),
      removeAdditionalSections: (value) =>
        set(() => ({
          additionalSections: get().additionalSections.filter(
            ({ key }) => key !== value.key
          ),
        })),
      // Resume Theme / Template
      resumeSettings: { ...DEFAULT_RESUME_SETTINGS },
      setResumeSettings: (patch) =>
        set(() => ({ resumeSettings: { ...get().resumeSettings, ...patch } })),

      setAdditionalSectionData: (sectionId, data) => {
        const sections = [...get().additionalSections];
        const section = sections.find(({ id }) => sectionId === id);
        section.data = data;
        set(() => ({ additionalSections: sections }));
      },

      // Cover letter (opt-in side feature — not part of the resume itself)
      coverLetter: { recipient: "", body: "" },
      setCoverLetter: (patch) =>
        set(() => ({ coverLetter: { ...get().coverLetter, ...patch } })),

      // Load a saved resume document into the editor. Merges onto defaults so
      // older saved data missing newer keys still renders. History is cleared
      // so undo can never jump back into the previously edited resume.
      applyResumeData: (data) => {
        const merged = defaultResumeData();
        for (const key of CONTENT_KEYS) {
          if (data && data[key] !== undefined) {
            try {
              merged[key] = JSON.parse(JSON.stringify(data[key]));
            } catch {
              merged[key] = data[key];
            }
          }
        }
        set(merged, false);
        if (typeof get().clearHistory === "function") {
          try {
            get().clearHistory();
          } catch {
            /* clearHistory lives on the returned api; available post-creation */
          }
        }
      },

      // Undo/redo status
      history: { canUndo: false, canRedo: false },
    })),
    {
      name: "resume-data", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => {
        // Persist content only — never the history bookkeeping.
        const out = {};
        for (const key of CONTENT_KEYS) out[key] = state[key];
        return out;
      },
    }
  )
);

if (typeof window !== "undefined") {
  window.store = useStore;
}

// Stamp saved-at on every persisted change (debounced to avoid per-keystroke writes).
if (typeof window !== "undefined") {
  let stampTimer = null;
  let lastStamp = null;
  useStore.subscribe((state) => {
    if (state && state.resumeSettings) {
      const now = Date.now();
      if (lastStamp === null || now - lastStamp > 15000) {
        lastStamp = now;
        stampSavedAt();
        return;
      }
      if (stampTimer) clearTimeout(stampTimer);
      stampTimer = setTimeout(() => {
        lastStamp = Date.now();
        stampSavedAt();
      }, 2000);
    }
  });
}

export const getLastSavedAt = () => {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(SAVED_AT_KEY);
  const ts = value ? Number(value) : 0;
  return ts && ts > 0 ? ts : null;
};

export const clearSavedAt = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVED_AT_KEY);
};