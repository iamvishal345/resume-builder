// Named snapshots of a resume document (IndexedDB, local only).
import { openDb, requestResult } from "./db";

const STORE = "versions";

const clone = (data) =>
  typeof structuredClone === "function"
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data));

const summarize = (data = {}) => {
  const pd = data.personalDetails || {};
  const name = [pd.firstName, pd.lastName].filter(Boolean).join(" ");
  const roles = (data.workHistory || []).length;
  const skills = (data.skills || []).length;
  return [name || "Untitled", `${roles} roles`, `${skills} skills`].join(" · ");
};

export const saveVersion = async (resumeId, data, name = "") => {
  const db = await openDb();
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
    summary: summarize(data),
  };
  const tx = db.transaction(STORE, "readwrite");
  await requestResult(tx.objectStore(STORE).put(entry));
  const all = await listVersions(resumeId);
  if (all.length > 20) {
    const tx2 = db.transaction(STORE, "readwrite");
    for (const v of all.slice(20)) {
      await requestResult(tx2.objectStore(STORE).delete(v.id));
    }
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
