import { describe, expect, it, vi } from "vitest";
import { latexDocumentOf } from "./index.js";
import {
  compileResumeLatex,
  latexJobOf,
  plainLatexFailure,
} from "./compile.js";

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
  skills: [{ name: "TeX" }],
  additionalSections: [],
  resumeSettings: { sectionOrder: ["skills"], latexTemplateId: "classic" },
  ...patch,
});

describe("latex compile input", () => {
  it("uses the selected template and ignores a hand-written latexSource", () => {
    const classic = latexDocumentOf(
      resume({
        latexSource: "\\input{evil}",
        resumeSettings: { latexTemplateId: "classic", sectionOrder: ["skills"] },
      }),
    );
    expect(classic).toContain("\\cvsection{Skills}");
    expect(classic).not.toContain("\\input{evil}");
    expect(classic).not.toContain("enumitem");
    expect(classic).not.toContain("fontspec");
    expect(classic).not.toContain("iftex");

    const compactJob = latexJobOf(
      resume({
        latexSource: "HAND WRITTEN",
        resumeSettings: { latexTemplateId: "compact", sectionOrder: ["skills"] },
      }),
    );
    expect(compactJob.engine).toBe("pdflatex");
    expect(compactJob.templateId).toBe("compact");
    expect(compactJob.source).toContain("\\cvsec{Skills}");
    expect(compactJob.source).toContain("\\item TeX");
    expect(compactJob.source).not.toContain("\\cvsection{");
    expect(compactJob.source).not.toContain("HAND WRITTEN");
  });

  it("compiles through an injected engine and rejects a failed result", async () => {
    const compile = vi.fn(async (job) => {
      expect(job.engine).toBe("pdflatex");
      expect(job.source).toContain("\\documentclass");
      expect(job.source).toContain("\\cvsection{Skills}");
      return { success: true, pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46]) };
    });
    const ok = await compileResumeLatex(resume(), { compile });
    expect(compile).toHaveBeenCalledOnce();
    expect(Array.from(ok.pdf.slice(0, 4))).toEqual([0x25, 0x50, 0x44, 0x46]);
    expect(ok.templateId).toBe("classic");

    const failed = await compileResumeLatex(resume(), {
      compile: async () => ({
        success: false,
        error: "compile failed",
        log: "! LaTeX Error: File `enumitem.sty' not found.\n",
      }),
    }).then(
      () => null,
      (error) => error,
    );
    expect(failed).toBeInstanceOf(Error);
    expect(failed.message).toMatch(/enumitem\.sty/);
    expect(failed.message).not.toMatch(/%PDF/);
  });

  it("turns an engine crash into a plain message", () => {
    expect(plainLatexFailure(new Error("Failed to fetch"))).toMatch(
      /could not be downloaded/i,
    );
    expect(plainLatexFailure(new Error("Compilation timeout"))).toMatch(
      /took too long/i,
    );
    expect(plainLatexFailure("fileManifest not set")).toBe(
      "fileManifest not set",
    );
    expect(plainLatexFailure(new Error(""))).toMatch(/could not build that PDF/);
  });
});
