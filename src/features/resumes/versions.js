// Named snapshots of a resume document (IndexedDB, local only).
import { openDb, requestResult } from "./db";
import { diffVersions, formatDiffLines } from "./versionDiff";

const STORE = "versions";
const MAX_PER_RESUME = 20;

const clone = (data) =>
  typeof structuredClone === "function"
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data));

const summarize = (data = {}, previous = null) => {
  const pd = data.personalDetails || {};
  const name = [pd.firstName, pd.lastName].filter(Boolean).join(" ");
  const roles = (data.workHistory || []).length;
  const skills = (data.skills || []).length;
  const base = [name || "Untitled", `${roles} roles`, `${skills} skills`].join(
    " · ",
  );
  if (!previous) return base;
  const changes = formatDiffLines(diffVersions(previous, data));
  if (!changes.length) return `${base} · no content change`;
  return `${base} · vs prior: ${changes.slice(0, 3).join("; ")}`;
};

export const saveVersion = async (resumeId, data, name = "") => {
  const existing = await listVersions(resumeId);
  const prior = existing[0];
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ver-${Date.now()}`;
  const entry = {
    id,
    resumeId,
    name: name || `Snapshot · ${new Date().toLocaleString()}`,
    createdAt: Date.now(),
    data: clone(data),
    summary: summarize(data, prior?.data || null),
  };

  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  await requestResult(store.put(entry));
  // Keep newest MAX_PER_RESUME — existing is newest-first; drop the tail.
  const overflow = existing.slice(MAX_PER_RESUME - 1);
  for (const v of overflow) {
    await requestResult(store.delete(v.id));
  }
  return entry;
};

export const listVersions = async (resumeId) => {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const all = await requestResult(tx.objectStore(STORE).getAll());
  return all
    .filter((v) => v.resumeId === resumeId)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

/** Cheap total count — avoids loading version payloads. */
export const countAllVersions = async () => {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  return requestResult(tx.objectStore(STORE).count());
};

export const getVersion = async (id) => {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  return requestResult(tx.objectStore(STORE).get(id));
};

export const deleteVersion = async (id) => {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  await requestResult(tx.objectStore(STORE).delete(id));
};

export const deleteVersionsForResume = async (resumeId) => {
  const all = await listVersions(resumeId);
  if (!all.length) return;
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  for (const v of all) {
    await requestResult(tx.objectStore(STORE).delete(v.id));
  }
};
