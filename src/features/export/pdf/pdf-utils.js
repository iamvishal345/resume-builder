const round = (value) => Math.round(value);

const decodeHtml = (value = "") =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');

// Converts simple rich text (exported by the editor as <p>/<ul> HTML) into
// printable paragraphs and bullet lines.
export const htmlLines = (html) => {
  const text = decodeHtml(html || "");
  if (!text.trim()) return [];
  const out = [];
  text.replace(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => {
    const clean = inner.replace(/<[^>]*>/g, "").trim();
    if (clean)
      out.push({ type: tag === "li" ? "bullet" : "para", text: clean });
    return match;
  });
  if (!out.length) {
    const clean = text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (clean) out.push({ type: "para", text: clean });
  }
  return out;
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export const rangeText = (start, end, disabledEnd) => {
  const from = formatDate(start);
  const to = disabledEnd || end === "Present" ? "Present" : formatDate(end);
  if (!from && !to) return "";
  return [from, to].filter(Boolean).join(" – ");
};

export const pdfContactParts = (pd, socialLinks) => {
  const location = [pd.address, pd.city, pd.state, pd.country, pd.pinCode]
    .filter(Boolean)
    .join(", ");
  return [
    pd.email,
    pd.contactNumber,
    location,
    ...socialLinks.map((link) =>
      link.value ? `${link.descriptionValue || "Link"}: ${link.value}` : "",
    ),
  ].filter(Boolean);
};

export { round, decodeHtml };
