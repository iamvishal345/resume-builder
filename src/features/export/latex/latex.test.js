import { describe, expect, it } from "vitest";
import { escapeLatex } from "./escape.js";
import { buildResumeLatex } from "./classic.js";
import { buildCompactLatex } from "./compact.js";
import { buildCoverLetterLatex } from "./letter.js";
import { latexDocumentOf } from "./index.js";

const resume = (patch = {}) => ({
  personalDetails: {
    firstName: "Ada",
    lastName: "Lovelace",
    designation: "Engineer",
    email: "ada@example.com",
  },
  socialLinks: [],
  resumeSummary: "",
  workHistory: [],
  education: [],
  skills: [],
  additionalSections: [],
  resumeSettings: { sectionOrder: [] },
  ...patch,
});

describe("escapeLatex", () => {
  it("escapes TeX specials in one pass", () => {
    expect(escapeLatex("A & B_100% #1 $2 {x} ~^ \\")).toBe(
      "A \\& B\\_100\\% \\#1 \\$2 \\{x\\} \\textasciitilde{}\\textasciicircum{} \\textbackslash{}",
    );
  });

  it("flattens newlines so a field cannot break out of a line", () => {
    expect(escapeLatex("one\ntwo")).toBe("one two");
  });
});

describe("buildResumeLatex", () => {
  it("omits empty sections", () => {
    const tex = buildResumeLatex(
      resume({
        skills: [{ name: "TeX" }],
        resumeSettings: { sectionOrder: ["skills", "summary", "experience"] },
      }),
    );
    expect(tex).toContain("\\cvsection{Skills}");
    expect(tex).toContain("TeX\\par");
    expect(tex).not.toContain("\\cvsection{Summary}");
    expect(tex).not.toContain("\\cvsection{Experience}");
    expect(tex.startsWith("\\documentclass[11pt]{article}")).toBe(true);
    expect(tex.trimEnd().endsWith("\\end{document}")).toBe(true);
  });

  it("follows section order and escapes role text", () => {
    const tex = buildResumeLatex(
      resume({
        personalDetails: {
          firstName: "Ada",
          lastName: "Lovelace & Co",
        },
        resumeSummary: "Built tools.",
        workHistory: [
          {
            positionTitle: "Lead",
            companyName: "Analytical_Engines",
            startDate: "2019-06",
            disabledendDate: true,
            workSummary: "<ul><li>Shipped 100%</li><li>Cut cost $2</li></ul>",
          },
        ],
        skills: [{ name: "C++" }],
        resumeSettings: { sectionOrder: ["experience", "summary", "skills"] },
      }),
    );
    expect(tex).toContain("Lovelace \\& Co");
    expect(tex).toContain("Analytical\\_Engines");
    expect(tex).toContain("Jun 2019 -- Present");
    expect(tex).toContain("\\item Shipped 100\\%");
    expect(tex).toContain("\\item Cut cost \\$2");
    const experience = tex.indexOf("\\cvsection{Experience}");
    const summary = tex.indexOf("\\cvsection{Summary}");
    const skills = tex.indexOf("\\cvsection{Skills}");
    expect(experience).toBeGreaterThan(-1);
    expect(summary).toBeGreaterThan(experience);
    expect(skills).toBeGreaterThan(summary);
  });

  it("includes an extra section that has content", () => {
    const tex = buildResumeLatex(
      resume({
        additionalSections: [
          {
            id: 42,
            kind: 5,
            title: "Languages",
            data: [{ name: "French" }],
          },
        ],
      }),
    );
    expect(tex).toContain("\\cvsection{Languages}");
    expect(tex).toContain("\\item French");
  });
});

describe("latexDocumentOf", () => {
  it("generates from the form even when an old latexSource string is saved", () => {
    const custom = "\\documentclass{article}\n\\begin{document}\nHi\n\\end{document}\n";
    const data = resume({ skills: [{ name: "TeX" }], latexSource: custom });
    expect(latexDocumentOf(data)).toBe(buildResumeLatex(data));
    expect(latexDocumentOf(data)).not.toBe(custom);
    expect(latexDocumentOf({ ...data, latexSource: null })).toBe(
      buildResumeLatex(data),
    );
  });

  it("changes section markup when the compact template is selected", () => {
    const data = resume({
      personalDetails: {
        firstName: "Ada",
        lastName: "Lovelace",
        designation: "Engineer",
        email: "ada@example.com",
      },
      workHistory: [
        {
          positionTitle: "Lead",
          companyName: "Analytical_Engines",
          startDate: "2019-06",
          disabledendDate: true,
          workSummary: "<ul><li>Shipped</li></ul>",
        },
      ],
      skills: [{ name: "TeX" }],
      resumeSettings: {
        sectionOrder: ["experience", "skills"],
        latexTemplateId: "classic",
      },
    });
    const classic = latexDocumentOf(data);
    const compact = latexDocumentOf({
      ...data,
      latexSource: null,
      resumeSettings: { ...data.resumeSettings, latexTemplateId: "compact" },
    });
    expect(classic).toBe(buildResumeLatex(data));
    expect(classic).toContain("\\cvsection{Experience}");
    expect(classic).toContain("\\hrule");
    expect(classic).toContain(
      "\\noindent\\textbf{Lead}\\hfill Jun 2019 -- Present",
    );
    expect(classic).toContain("TeX\\par");
    expect(compact).toBe(buildCompactLatex({ ...data, resumeSettings: { ...data.resumeSettings, latexTemplateId: "compact" } }));
    expect(compact).toContain("\\cvsec{Experience}");
    expect(compact).toContain("\\MakeUppercase");
    expect(compact).not.toContain("\\cvsection{");
    expect(compact).not.toContain("\\hrule");
    expect(compact).toContain("\\textbf{Analytical\\_Engines}");
    expect(compact).toContain("Lead (Jun 2019 -- Present)");
    expect(compact).toContain("\\item TeX");
    expect(compact.indexOf("\\cvsec{Experience}")).toBeLessThan(
      compact.indexOf("\\cvsec{Skills}"),
    );
    expect(latexDocumentOf({ ...data, resumeSettings: { latexTemplateId: "sidebar" } })).toBe(
      buildResumeLatex(data),
    );
  });

  it("follows the selected template when an old latexSource string is saved", () => {
    const custom =
      "\\documentclass{article}\n\\begin{document}\nCustom\n\\end{document}\n";
    const data = resume({
      latexSource: custom,
      skills: [{ name: "TeX" }],
      resumeSettings: { latexTemplateId: "compact" },
    });
    const tex = latexDocumentOf(data);
    expect(tex).toBe(buildCompactLatex(data));
    expect(tex).not.toContain("Custom");
    expect(tex).toContain("\\cvsec{");
  });
});

describe("buildCoverLetterLatex", () => {
  it("escapes recipient, contact, and body", () => {
    const tex = buildCoverLetterLatex({
      personalDetails: {
        firstName: "A&B",
        lastName: "Smith",
        email: "a_b@example.com",
      },
      socialLinks: [],
      coverLetter: {
        recipient: "HR_100%",
        body: "<p>Save $2 &amp; ship.</p><ul><li>Own 100%</li></ul>",
      },
    });
    expect(tex).toContain("A\\&B");
    expect(tex).toContain("a\\_b@example.com");
    expect(tex).toContain("HR\\_100\\%");
    expect(tex).toContain("Save \\$2 \\& ship.");
    expect(tex).toContain("\\item Own 100\\%");
    expect(tex.trimEnd().endsWith("\\end{document}")).toBe(true);
  });

  it("emits a valid document when the letter is empty", () => {
    const tex = buildCoverLetterLatex({
      personalDetails: {},
      coverLetter: { recipient: "", body: "" },
    });
    expect(tex.startsWith("\\documentclass[11pt]{article}")).toBe(true);
    expect(tex).toContain("\\begin{document}");
    expect(tex.trimEnd().endsWith("\\end{document}")).toBe(true);
    expect(tex).not.toMatch(/\\item(?![a-z])/);
    expect(tex).not.toContain("\\cvsection");
  });
});
