// JSON backup: single resume (.r.json) + full library pack (.cavren.json).
import { getDemoMode } from "./prefs";
import { isJsonResume, fromJsonResume } from "@features/import/jsonResume";

const RESUME_TYPE = "resume-builder/resume";
const PACK_TYPE = "cavren/backup-pack";
const ENVELOPE_VERSION = 1;
const PACK_VERSION = 1;

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

const toResumeEnvelope = (doc) => ({
  type: RESUME_TYPE,
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
  const blob = new Blob([JSON.stringify(toResumeEnvelope(doc), null, 2)], {
    type: "application/json",
  });
  const name = doc?.data?.personalDetails
    ? [doc.data.personalDetails.firstName, doc.data.personalDetails.lastName]
        .filter(Boolean)
        .join(" ")
    : doc?.name;
  triggerDownload(blob, `${slug(name)}.r.json`);
};

export const buildBackupPack = (docs, extras = {}) => ({
  type: PACK_TYPE,
  version: PACK_VERSION,
  exportedAt: new Date().toISOString(),
  prefs: {
    demos: getDemoMode(),
    ...extras.prefs,
  },
  resumes: (docs || []).map((doc) => ({
    id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    data: doc.data,
  })),
  versions: extras.versions || [],
});

export const exportBackupPack = (docs, extras) => {
  const pack = buildBackupPack(docs, extras);
  const blob = new Blob([JSON.stringify(pack, null, 2)], {
    type: "application/json",
  });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `cavren-backup-${stamp}.cavren.json`);
  return pack;
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
  if (parsed.type === PACK_TYPE) {
    return { ok: true, kind: "pack", pack: parsed };
  }
  let doc = null;
  if (parsed.type === RESUME_TYPE && parsed.doc && parsed.doc.data) {
    doc = parsed.doc;
  } else if (parsed.type !== RESUME_TYPE && parsed.data && typeof parsed.data === "object") {
    doc = parsed;
  }
  if (!doc) {
    if (isJsonResume(parsed)) {
      return {
        ok: true,
        kind: "json-resume",
        data: fromJsonResume(parsed),
      };
    }
    return { ok: false, error: "This file does not contain resume data." };
  }
  return { ok: true, kind: "resume", doc };
};

export const readResumeBackupFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error || new Error("Could not read file."));
    reader.readAsText(file);
  });

const parenthesizedName = (name = "") => {
  if (name && !/\s+\(copy\)$/i.test(name)) return name;
  return name || "Restored resume";
};

export const restoreFromText = async (
  text,
  { newResume, putResume, clearAllResumes, mode = "merge" },
) => {
  const parsed = parseResumeBackup(text);
  if (!parsed.ok) return parsed;

  if (parsed.kind === "pack") {
    const resumes = parsed.pack.resumes || [];
    if (mode === "replace" && clearAllResumes) {
      await clearAllResumes();
    }
    const created = [];
    for (const item of resumes) {
      const doc = newResume(parenthesizedName(item.name), item.data);
      // Keep stable id when replacing so Drive round-trips feel natural
      if (mode === "replace" && item.id) doc.id = item.id;
      doc.createdAt = item.createdAt || doc.createdAt;
      doc.updatedAt = Date.now();
      await putResume(doc);
      created.push(doc);
    }
    return {
      ok: true,
      kind: "pack",
      count: created.length,
      docs: created,
      prefs: parsed.pack.prefs,
    };
  }

  if (parsed.kind === "json-resume") {
    const basicsName = parsed.data?.personalDetails
      ? [parsed.data.personalDetails.firstName, parsed.data.personalDetails.lastName]
          .filter(Boolean)
          .join(" ")
      : "";
    const doc = newResume(basicsName || "JSON Resume", parsed.data);
    await putResume(doc);
    return { ok: true, kind: "json-resume", doc };
  }

  if (parsed.kind !== "resume" || !parsed.doc) {
    return { ok: false, error: "This file does not contain resume data." };
  }

  const doc = newResume(parenthesizedName(parsed.doc.name), parsed.doc.data);
  await putResume(doc);
  return { ok: true, kind: "resume", doc };
};
