/** Light section-level diff between two resumeDataOf snapshots. */
import { stripHtmlFlat } from "@lib/text";

/** Fingerprint photo without reading base64 pixels. */
const photoKey = (pd = {}) => {
  const url = pd.photoDataUrl || "";
  if (!url) return "none";
  return `len:${url.length}`;
};

const skillNames = (skills) =>
  new Set(
    (Array.isArray(skills) ? skills : [])
      .map((s) => (typeof s === "string" ? s : s?.name || ""))
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );

const roleKey = (r, i) => r?.key || `i:${i}`;

const compareLists = (a = [], b = [], keyFn, labelOf) => {
  const aMap = new Map(a.map((item, i) => [keyFn(item, i), item]));
  const bMap = new Map(b.map((item, i) => [keyFn(item, i), item]));
  let added = 0;
  let removed = 0;
  let changed = 0;
  for (const [k, item] of bMap) {
    if (!aMap.has(k)) added += 1;
    else if (labelOf(aMap.get(k)) !== labelOf(item)) changed += 1;
  }
  for (const k of aMap.keys()) {
    if (!bMap.has(k)) removed += 1;
  }
  return { added, removed, changed };
};

const formatCountParts = ({ added, removed, changed }) => {
  const parts = [];
  if (added) parts.push(`+${added}`);
  if (removed) parts.push(`−${removed}`);
  if (changed) parts.push(`${changed} edited`);
  return parts.join(" · ");
};

const pushChange = (out, section, detail) => {
  if (detail) out.push({ section, status: "changed", detail });
};

const extraFingerprint = (section) => {
  const items = section?.data || [];
  // Avoid JSON.stringify of large blobs — title + count + light field peek.
  const peek = items
    .slice(0, 8)
    .map((i) => i?.name || i?.title || i?.role || i?.organization || "")
    .join(",");
  return `${section?.title || ""}|${items.length}|${peek}`;
};

/**
 * Diff snapshot `from` → `to` (typically snapshot vs current).
 * @returns {{ section: string, status: string, detail: string }[]}
 */
export const diffVersions = (from = {}, to = {}) => {
  const out = [];

  const pdA = from.personalDetails || {};
  const pdB = to.personalDetails || {};
  const nameA = [pdA.firstName, pdA.lastName].filter(Boolean).join(" ");
  const nameB = [pdB.firstName, pdB.lastName].filter(Boolean).join(" ");
  const pdBits = [];
  if (nameA !== nameB) pdBits.push("name");
  if ((pdA.designation || "") !== (pdB.designation || "")) pdBits.push("title");
  if ((pdA.email || "") !== (pdB.email || "")) pdBits.push("email");
  if (photoKey(pdA) !== photoKey(pdB)) {
    if (!pdA.photoDataUrl && pdB.photoDataUrl) pdBits.push("photo added");
    else if (pdA.photoDataUrl && !pdB.photoDataUrl) pdBits.push("photo removed");
    else pdBits.push("photo changed");
  }
  if (pdBits.length) pushChange(out, "Personal", pdBits.join(", "));

  const sumA = stripHtmlFlat(from.resumeSummary);
  const sumB = stripHtmlFlat(to.resumeSummary);
  if (sumA !== sumB) {
    pushChange(
      out,
      "Summary",
      !sumA && sumB ? "added" : sumA && !sumB ? "removed" : "edited",
    );
  }

  const roles = compareLists(
    from.workHistory,
    to.workHistory,
    roleKey,
    (r) =>
      `${r?.positionTitle || ""}|${r?.companyName || ""}|${stripHtmlFlat(r?.workSummary)}`,
  );
  if (roles.added || roles.removed || roles.changed) {
    pushChange(out, "Experience", formatCountParts(roles));
  }

  const edu = compareLists(
    from.education,
    to.education,
    roleKey,
    (e) => `${e?.degree || ""}|${e?.schoolName || ""}`,
  );
  if (edu.added || edu.removed || edu.changed) {
    pushChange(out, "Education", formatCountParts(edu));
  }

  const skA = skillNames(from.skills);
  const skB = skillNames(to.skills);
  let skAdd = 0;
  let skRem = 0;
  for (const s of skB) if (!skA.has(s)) skAdd += 1;
  for (const s of skA) if (!skB.has(s)) skRem += 1;
  if (skAdd || skRem) {
    pushChange(out, "Skills", formatCountParts({ added: skAdd, removed: skRem, changed: 0 }));
  }

  const extras = compareLists(
    from.additionalSections || [],
    to.additionalSections || [],
    (s) => String(s?.id ?? s?.title),
    extraFingerprint,
  );
  if (extras.added || extras.removed || extras.changed) {
    const parts = [];
    if (extras.added) parts.push(`+${extras.added} section(s)`);
    if (extras.removed) parts.push(`−${extras.removed}`);
    if (extras.changed) parts.push(`${extras.changed} edited`);
    pushChange(out, "Extras", parts.join(" · "));
  }

  const linksA = (from.socialLinks || []).length;
  const linksB = (to.socialLinks || []).length;
  if (linksA !== linksB) {
    pushChange(out, "Links", `${linksA} → ${linksB}`);
  }

  const sa = from.resumeSettings || {};
  const sb = to.resumeSettings || {};
  const themeBits = [];
  if ((sa.templateId || "") !== (sb.templateId || "")) themeBits.push("template");
  if ((sa.layoutId || "") !== (sb.layoutId || "")) themeBits.push("layout");
  if (
    (sa.paletteId || "") !== (sb.paletteId || "") ||
    (sa.primaryColor || "") !== (sb.primaryColor || "")
  ) {
    themeBits.push("colors");
  }
  if ((sa.fontId || "") !== (sb.fontId || "")) themeBits.push("font");
  if (themeBits.length) pushChange(out, "Theme", themeBits.join(", "));

  const ca = from.coverLetter || {};
  const cb = to.coverLetter || {};
  if (
    stripHtmlFlat(ca.body) !== stripHtmlFlat(cb.body) ||
    (ca.recipient || "") !== (cb.recipient || "")
  ) {
    pushChange(out, "Cover letter", "edited");
  }

  return out;
};

export const formatDiffLines = (diffs) =>
  (diffs || []).map((d) => `${d.section}: ${d.detail}`);
