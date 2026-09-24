import { describe, expect, it } from "vitest";
import { resolvePaper, PAPER_OPTIONS, paperCssVars } from "./paper.js";

describe("paper", () => {
  it("defaults to A4", () => {
    expect(resolvePaper().id).toBe("a4");
    expect(resolvePaper("nope").pdf).toBe("A4");
  });

  it("resolves US Letter", () => {
    const p = resolvePaper("letter");
    expect(p.pdf).toBe("LETTER");
    expect(p.widthMm).toBeGreaterThan(210);
    expect(p.heightMm).toBeLessThan(297);
  });

  it("emits css vars", () => {
    const vars = paperCssVars("letter");
    expect(vars["--r-page-width"]).toMatch(/mm$/);
    expect(PAPER_OPTIONS).toHaveLength(2);
  });
});
