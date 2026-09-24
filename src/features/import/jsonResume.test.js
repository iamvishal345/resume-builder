import { describe, expect, it } from "vitest";
import {
  isJsonResume,
  toJsonResume,
  fromJsonResume,
  parseJsonResumeText,
} from "./jsonResume.js";

const sampleStore = {
  personalDetails: {
    firstName: "Ada",
    lastName: "Lovelace",
    designation: "Analyst",
    email: "ada@example.com",
    contactNumber: "+1 555",
    city: "London",
    country: "UK",
  },
  socialLinks: [
    {
      descriptionValue: "GitHub",
      value: "https://github.com/ada",
    },
  ],
  resumeSummary: "<p>Mathematician and writer.</p>",
  workHistory: [
    {
      positionTitle: "Engineer",
      companyName: "Analytical Engine Co",
      startDate: "1842-01-01",
      endDate: "",
      disabledendDate: true,
      workSummary: "<ul><li>Wrote the first algorithm.</li></ul>",
    },
  ],
  education: [
    {
      schoolName: "Home",
      degree: "Self-taught",
      fieldOfStudy: "Mathematics",
      startDate: "1820-01-01",
      endDate: "1830-01-01",
    },
  ],
  skills: [{ name: "Mathematics", level: 5 }],
  additionalSections: [],
};

describe("jsonResume", () => {
  it("detects JSON Resume vs Cavren envelopes", () => {
    expect(isJsonResume({ basics: { name: "A" } })).toBe(true);
    expect(
      isJsonResume({ type: "resume-builder/resume", doc: {} }),
    ).toBe(false);
  });

  it("round-trips basics and work", () => {
    const jr = toJsonResume(sampleStore);
    expect(jr.basics.name).toBe("Ada Lovelace");
    expect(jr.work[0].highlights[0]).toMatch(/algorithm/i);

    const back = fromJsonResume(jr);
    expect(back.personalDetails.firstName).toBe("Ada");
    expect(back.personalDetails.lastName).toBe("Lovelace");
    expect(back.workHistory[0].companyName).toBe("Analytical Engine Co");
    expect(back.skills[0].name).toBe("Mathematics");
  });

  it("round-trips languages and awards extras", () => {
    const withExtras = {
      ...sampleStore,
      additionalSections: [
        {
          id: 5,
          kind: 5,
          title: "Languages",
          data: [{ key: "l1", name: "English", level: 5 }],
        },
        {
          id: 2,
          kind: 2,
          title: "Accomplishments",
          data: [
            {
              key: "a1",
              title: "Award",
              description: "<p>Won a hackathon.</p>",
            },
          ],
        },
      ],
    };
    const jr = toJsonResume(withExtras);
    expect(jr.languages[0].language).toBe("English");
    expect(jr.awards[0].title).toBe("Award");
    const back = fromJsonResume(jr);
    expect(back.additionalSections.some((s) => s.kind === 5)).toBe(true);
    expect(back.additionalSections.some((s) => s.kind === 2)).toBe(true);
  });

  it("parses text", () => {
    const text = JSON.stringify(toJsonResume(sampleStore));
    const parsed = parseJsonResumeText(text);
    expect(parsed.ok).toBe(true);
    expect(parsed.data.personalDetails.email).toBe("ada@example.com");
  });
});
