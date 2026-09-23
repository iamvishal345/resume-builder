// IndexedDB persistence for resume documents + version snapshots.
import { defaultResumeData } from "@store";

const DB_NAME = "resume-builder";
const DB_VERSION = 3;
const STORE = "resumes";
const VERSION_STORE = "versions";
const THEME_STORE = "themes";

let dbPromise = null;

export const openDb = () => {
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
      if (!db.objectStoreNames.contains(VERSION_STORE)) {
        const vs = db.createObjectStore(VERSION_STORE, { keyPath: "id" });
        vs.createIndex("byResume", "resumeId", { unique: false });
      }
      if (!db.objectStoreNames.contains(THEME_STORE)) {
        db.createObjectStore(THEME_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Failed to open IndexedDB"));
  });
  dbPromise = dbPromise.catch((error) => {
    dbPromise = null;
    throw error;
  });
  return dbPromise;
};

export const requestResult = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const newResume = (name = "Untitled resume", data) => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
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

export const clearAllResumes = async () => {
  const all = await listResumes();
  for (const doc of all) {
    await deleteResume(doc.id);
  }
  // Wipe versions store
  const db = await openDb();
  if (db.objectStoreNames.contains(VERSION_STORE)) {
    const tx = db.transaction(VERSION_STORE, "readwrite");
    await requestResult(tx.objectStore(VERSION_STORE).clear());
  }
  return all.length;
};

// One-time migration: the old single resume lived in the zustand persist
// `resume-data` localStorage blob. Promote it into IndexedDB only when the
// library is empty. Zustand still writes that key as a live editor cache, so
// we must never re-run after the first successful attempt (or when docs exist).
const LEGACY_MIGRATION_FLAG = "cavren-legacy-migrated";

let legacyMigrationInflight = null;

const markLegacyMigrated = () => {
  try {
    window.localStorage.setItem(LEGACY_MIGRATION_FLAG, "1");
  } catch {
    /* private mode */
  }
};

export const clearLegacyMigrationFlag = () => {
  try {
    window.localStorage.removeItem(LEGACY_MIGRATION_FLAG);
  } catch {
    /* private mode */
  }
};

export const migrateLegacyLocalStorage = async () => {
  if (typeof window === "undefined") return null;
  try {
    if (window.localStorage.getItem(LEGACY_MIGRATION_FLAG) === "1") {
      return null;
    }
  } catch {
    return null;
  }

  if (legacyMigrationInflight) return legacyMigrationInflight;

  legacyMigrationInflight = (async () => {
    try {
      // Re-check after claiming the in-flight slot.
      if (window.localStorage.getItem(LEGACY_MIGRATION_FLAG) === "1") {
        return null;
      }

      const existing = await listResumes();
      if (existing.length > 0) {
        markLegacyMigrated();
        return null;
      }

      const raw = window.localStorage.getItem("resume-data");
      if (!raw) {
        markLegacyMigrated();
        return null;
      }
      const parsed = JSON.parse(raw);
      const state = parsed && parsed.state;
      if (!state || !state.resumeSettings) {
        markLegacyMigrated();
        return null;
      }
      const hasContent =
        (state.personalDetails &&
          Object.keys(state.personalDetails).length > 0) ||
        (state.socialLinks && state.socialLinks.length > 0) ||
        (state.workHistory && state.workHistory.length > 0) ||
        (state.education && state.education.length > 0) ||
        (state.skills && state.skills.length > 0) ||
        (typeof state.resumeSummary === "string" &&
          state.resumeSummary.length > 0) ||
        (state.additionalSections && state.additionalSections.length > 0) ||
        Boolean(
          state.coverLetter &&
            (state.coverLetter.recipient || state.coverLetter.body),
        ) ||
        !isDefaultSettings(state.resumeSettings);
      if (!hasContent) {
        markLegacyMigrated();
        return null;
      }

      // Claim before put so overlapping callers cannot mint duplicates.
      markLegacyMigrated();

      const pd = state.personalDetails || {};
      const name =
        [pd.firstName, pd.lastName].filter(Boolean).join(" ") || "My resume";
      const doc = newResume(name, state);
      await putResume(doc);
      return doc;
    } catch {
      return null;
    } finally {
      legacyMigrationInflight = null;
    }
  })();

  return legacyMigrationInflight;
};

const isDefaultSettings = (settings) => {
  const base = defaultResumeData().resumeSettings;
  for (const key of Object.keys(base)) {
    if (settings[key] !== undefined && settings[key] !== base[key]) return false;
  }
  return true;
};
