// JSON backup (.r.json) for a single resume: download + file parsing.
// The envelope is versioned so older/other payloads can be detected cleanly.

const ENVELOPE_TYPE = "resume-builder/resume";
const ENVELOPE_VERSION = 1;

export const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const slug = (text = "") => {
  const out = text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return out || "resume";
};

// Broaden to a plain doc shape: { id?, name?, data: {...} }
const toEnvelope = (doc) => ({
  type: ENVELOPE_TYPE,
  version: ENVELOPE_VERSION,
  exportedAt: new Date().toISOString(),
  doc: {
    name: doc?.name || "",
    createdAt: doc?.createdAt ?? Date.now(),
    updatedAt: doc?.updatedAt ?? Date.now(),
    data: doc?.data || {},
  },
});

export const exportResumeJson = (doc) => {
  const blob = new Blob([JSON.stringify(toEnvelope(doc), null, 2)], {
    type: "application/json",
  });
  const name = doc?.data?.personalDetails
    ? [doc.data.personalDetails.firstName, doc.data.personalDetails.lastName]
        .filter(Boolean)
        .join(" ")
    : doc?.name;
  triggerDownload(blob, `${slug(name)}.r.json`);
};

export const parseResumeBackup = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not valid JSON." };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "This file is not a resume backup." };
  }
  let doc = null;
  if (parsed.type === ENVELOPE_TYPE && parsed.doc && parsed.doc.data) {
    doc = parsed.doc;
  } else if (parsed.type !== ENVELOPE_TYPE && parsed.data && typeof parsed.data === "object") {
    doc = parsed;
  }
  if (!doc) {
    return { ok: false, error: "This file does not contain resume data." };
  }
  return { ok: true, doc };
};

export const readResumeBackupFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Could not read file."));
    reader.readAsText(file);
  });

export const restoreFromText = async (text, { newResume, putResume }) => {
  const parsed = parseResumeBackup(text);
  if (!parsed.ok) return parsed;
  const doc = newResume(parenthesizedName(parsed.doc.name), parsed.doc.data);
  await putResume(doc);
  return { ok: true, doc };
};

const parenthesizedName = (name = "") => {
  if (name && !/\s+\(copy\)$/i.test(name)) return name;
  return name || "Restored resume";
};