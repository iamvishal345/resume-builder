// IndexedDB persistence for resume documents.
// One document per resume: id + name + timestamps + the full content payload.
import { defaultResumeData } from "@store";

const DB_NAME = "resume-builder";
const DB_VERSION = 1;
const STORE = "resumes";

let dbPromise = null;

const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
  dbPromise = dbPromise.catch((error) => {
    dbPromise = null;
    throw error;
  });
  return dbPromise;
};

const requestResult = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const newResume = (name = "Untitled resume", data) => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  data: { ...defaultResumeData(), ...(data || {}) },
});

export const listResumes = async () => {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const all = await requestResult(tx.objectStore(STORE).getAll());
  return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};

export const getResume = async (id) => {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  return requestResult(tx.objectStore(STORE).get(id));
};

export const putResume = async (doc) => {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  await requestResult(tx.objectStore(STORE).put(doc));
};

export const deleteResume = async (id) => {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  await requestResult(tx.objectStore(STORE).delete(id));
};

// One-time migration: the old single resume lived in the zustand persist
// `resume-data` localStorage blob. If IndexedDB is empty, promote it into a
// document so the new listing page is the single source of truth.
export const migrateLegacyLocalStorage = async () => {
  try {
    const raw = window.localStorage.getItem("resume-data");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed && parsed.state;
    if (!state || !state.resumeSettings) return null;
    // The editor's own persistence cache ("resume-data") is written whenever the
    // store is created, even when empty. Only migrate when the legacy blob has
    // real content, otherwise an empty draft would silently become a resume.
    const hasContent =
      (state.personalDetails && Object.keys(state.personalDetails).length > 0) ||
      (state.socialLinks && state.socialLinks.length > 0) ||
      (state.workHistory && state.workHistory.length > 0) ||
      (state.education && state.education.length > 0) ||
      (state.skills && state.skills.length > 0) ||
      (typeof state.resumeSummary === "string" && state.resumeSummary.length > 0) ||
      (state.additionalSections && state.additionalSections.length > 0) ||
      Boolean(state.coverLetter && (state.coverLetter.recipient || state.coverLetter.body)) ||
      !isDefaultSettings(state.resumeSettings);
    if (!hasContent) return null;
    const pd = state.personalDetails || {};
    const name =
      [pd.firstName, pd.lastName].filter(Boolean).join(" ") || "My resume";
    const doc = newResume(name, state);
    await putResume(doc);
    window.localStorage.removeItem("resume-data");
    window.localStorage.removeItem("resume-data-saved-at");
    return doc;
  } catch {
    return null;
  }
};

const isDefaultSettings = (settings) => {
  const base = defaultResumeData().resumeSettings;
  for (const key of Object.keys(base)) {
    if (settings[key] !== undefined && settings[key] !== base[key]) return false;
  }
  return true;
};