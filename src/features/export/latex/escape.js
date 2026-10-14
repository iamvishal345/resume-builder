const ESCAPES = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  $: "\\$",
  "#": "\\#",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

/** Plain text safe to drop into a LaTeX document body. */
export const escapeLatex = (value) =>
  String(value ?? "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/[\\&%$#_{}~^]/g, (ch) => ESCAPES[ch]);
