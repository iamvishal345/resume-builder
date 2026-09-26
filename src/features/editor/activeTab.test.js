import { describe, it, expect } from "vitest";
import { parseActiveTabParam, MODE_TO_ACTIVE_TAB } from "./activeTab";

describe("parseActiveTabParam", () => {
  it("parses resume-editor activeTab parameter", () => {
    const params = new URLSearchParams("activeTab=resume-editor");
    expect(parseActiveTabParam(params)).toBe("editor");
  });

  it("parses resume-preview activeTab parameter", () => {
    const params = new URLSearchParams("activeTab=resume-preview");
    expect(parseActiveTabParam(params)).toBe("preview");
  });

  it("parses cover-latter activeTab parameter", () => {
    const params = new URLSearchParams("activeTab=cover-latter");
    expect(parseActiveTabParam(params)).toBe("letter");
  });

  it("parses cover-letter activeTab parameter alias", () => {
    const params = new URLSearchParams("activeTab=cover-letter");
    expect(parseActiveTabParam(params)).toBe("letter");
  });

  it("falls back to view parameter if activeTab is not present", () => {
    const params = new URLSearchParams("view=preview");
    expect(parseActiveTabParam(params)).toBe("preview");
  });

  it("returns null for unknown parameters", () => {
    const params = new URLSearchParams("foo=bar");
    expect(parseActiveTabParam(params)).toBeNull();
  });

  it("maps editor modes to canonical activeTab query values", () => {
    expect(MODE_TO_ACTIVE_TAB.editor).toBe("resume-editor");
    expect(MODE_TO_ACTIVE_TAB.preview).toBe("resume-preview");
    expect(MODE_TO_ACTIVE_TAB.letter).toBe("cover-latter");
  });
});
