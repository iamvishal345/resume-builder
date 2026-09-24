import { describe, expect, it } from "vitest";
import {
  analyzeReadingLevel,
  formatReadingHint,
} from "./readingLevel.js";

describe("analyzeReadingLevel", () => {
  it("handles empty text", () => {
    const a = analyzeReadingLevel("");
    expect(a.grade).toBeNull();
    expect(formatReadingHint(a)).toMatch(/Add text/i);
  });

  it("scores simple sentences", () => {
    const a = analyzeReadingLevel(
      "I built tools. I led a team of five people.",
    );
    expect(a.words).toBeGreaterThan(5);
    expect(a.grade).toBeTypeOf("number");
    expect(formatReadingHint(a)).toMatch(/grade/);
  });
});
