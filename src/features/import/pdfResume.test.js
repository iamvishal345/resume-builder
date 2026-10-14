import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyPdfExtract,
  mapAiResumePayload,
  mapLocalResumeText,
  parseResumeImport,
  structureResumeText,
} from "./pdfResume.js";

const aiMocks = vi.hoisted(() => ({
  enabled: false,
  aiGenerate: vi.fn(),
  isAiAvailable: vi.fn(() => false),
}));

vi.mock("@features/ai/provider", async () => {
  const actual = await vi.importActual("@features/ai/provider");
  return {
    ...actual,
    isAiAvailable: () =>
      aiMocks.enabled ? aiMocks.isAiAvailable() : actual.isAiAvailable(),
    aiGenerate: (...args) =>
      aiMocks.enabled ? aiMocks.aiGenerate(...args) : actual.aiGenerate(...args),
  };
});

const FIXTURE = `Ada Lovelace
Analyst
ada@example.com
+1 555 010 9999

SUMMARY
Wrote <script>alert(1)</script> notes.

EXPERIENCE
Engineer at Analytical Engine Co — 2020 - Present
- Built the <b>engine</b>

EDUCATION
Self-taught at Home — 2016 - 2020

SKILLS
Mathematics, Algorithms
`;

const samplePayload = {
  personalDetails: {
    firstName: "Ada",
    lastName: "Lovelace",
    designation: "Analyst",
    email: "ada@example.com",
    contactNumber: "+1 555 010 9999",
    city: "London",
    ignoredBio: "drop me",
  },
  socialLinks: [
    { label: "GitHub", url: "https://github.com/ada" },
    { url: "javascript:alert(1)" },
  ],
  resumeSummary: "Wrote <script>alert(1)</script> notes.",
  workHistory: [
    {
      positionTitle: "Engineer",
      companyName: "Analytical Engine Co",
      location: "London",
      startDate: "1842",
      endDate: "",
      current: true,
      bullets: ["Built the <b>engine</b>"],
      evil: "<img src=x onerror=alert(1)>",
    },
    null,
    "nope",
    { positionTitle: 12 },
  ],
  education: [
    {
      schoolName: "Home",
      degree: "Self-taught",
      fieldOfStudy: "Mathematics",
      startDate: "1820",
      endDate: "1830",
    },
  ],
  skills: [{ name: "Mathematics", level: 5 }, "SQL", null],
  additionalSections: [
    { kind: "languages", items: [{ name: "English", level: 5 }] },
  ],
  resumeSettings: { templateId: "hacked" },
  coverLetter: { body: "nope" },
  latexSource: "\\input{evil}",
  apiKey: "sk-secret",
};

describe("pdf resume parser", () => {
  it("maps fixture text locally and escapes markup", () => {
    const result = mapLocalResumeText(FIXTURE);
    expect(result.ok).toBe(true);
    expect(result.source).toBe("local");
    expect(result.data.personalDetails.firstName).toBe("Ada");
    expect(result.data.personalDetails.lastName).toBe("Lovelace");
    expect(result.data.personalDetails.email).toBe("ada@example.com");
    expect(result.data.personalDetails.designation).toBe("Analyst");
    expect(result.preview.jobs).toBe(1);
    expect(result.data.workHistory[0].companyName).toMatch(/Analytical Engine/);
    expect(result.data.workHistory[0].startDate).toBe("2020-01-01");
    expect(result.data.workHistory[0].disabledendDate).toBe(true);
    expect(result.data.education[0].schoolName).toMatch(/Home/);
    expect(result.data.skills.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["Mathematics", "Algorithms"]),
    );
    expect(result.data.resumeSummary).toContain("&lt;script&gt;");
    expect(result.data.resumeSummary).not.toContain("<script>");
    expect(result.data.workHistory[0].workSummary).toContain("&lt;b&gt;");
    expect(result.data.workHistory[0].workSummary).not.toContain("<b>");
  });

  it("maps a sample AI payload into store shape and drops unknown keys", () => {
    const result = mapAiResumePayload(samplePayload);
    expect(result.ok).toBe(true);
    expect(result.data.personalDetails).toMatchObject({
      firstName: "Ada",
      lastName: "Lovelace",
      designation: "Analyst",
      email: "ada@example.com",
      city: "London",
    });
    expect(result.data.personalDetails.ignoredBio).toBeUndefined();
    expect(result.data.resumeSettings).toBeUndefined();
    expect(result.data.coverLetter).toBeUndefined();
    expect(result.data.latexSource).toBeUndefined();
    expect(JSON.stringify(result.data)).not.toMatch(/sk-secret|hacked|\\input/);
    expect(result.data.socialLinks).toHaveLength(1);
    expect(result.data.socialLinks[0].value).toBe("https://github.com/ada");
    expect(result.data.resumeSummary).not.toMatch(/<script/i);
    expect(result.data.resumeSummary).toContain("alert(1)");
    expect(result.data.workHistory).toHaveLength(1);
    expect(result.data.workHistory[0]).toMatchObject({
      positionTitle: "Engineer",
      companyName: "Analytical Engine Co",
      location: "London",
      startDate: "1842-01-01",
      disabledendDate: true,
      endDate: "",
    });
    expect(result.data.workHistory[0].workSummary).toContain("engine");
    expect(result.data.workHistory[0].workSummary).not.toMatch(/<b>|<img/i);
    expect(result.data.education[0]).toMatchObject({
      schoolName: "Home",
      degree: "Self-taught",
      fieldOfStudy: "Mathematics",
    });
    expect(result.data.skills).toEqual([
      expect.objectContaining({ name: "Mathematics", level: 5 }),
    ]);
    expect(result.data.additionalSections[0]).toMatchObject({
      id: 5,
      kind: 5,
      title: "Languages",
    });
    expect(result.data.additionalSections[0].data[0].name).toBe("English");
    expect(result.preview).toMatchObject({
      name: "Ada Lovelace",
      role: "Analyst",
      jobs: 1,
      education: 1,
      skills: 1,
    });
  });

  it("rejects garbage model output", () => {
    expect(mapAiResumePayload(null)).toMatchObject({ ok: false, reason: "not-object" });
    expect(mapAiResumePayload([])).toMatchObject({ ok: false, reason: "not-object" });
    expect(mapAiResumePayload("hello there")).toMatchObject({
      ok: false,
      reason: "not-object",
    });
    expect(mapAiResumePayload({ foo: "bar", count: 3 })).toMatchObject({
      ok: false,
      reason: "no-resume-content",
    });
    expect(mapAiResumePayload("```json\n{not json}\n```")).toMatchObject({
      ok: false,
      reason: "not-json",
    });
    expect(mapAiResumePayload({ workHistory: "nope", skills: [null, 1, "SQL"] })).toMatchObject({
      ok: false,
      reason: "no-resume-content",
    });
    const huge = { personalDetails: { firstName: "A".repeat(200_000) } };
    expect(mapAiResumePayload(huge)).toMatchObject({ ok: false, reason: "too-large" });
  });

  it("classifies empty PDF text without inventing content", () => {
    expect(classifyPdfExtract({ text: "", pageCount: 0 })).toMatchObject({
      ok: false,
      code: "empty",
    });
    expect(classifyPdfExtract({ text: "   \n", pageCount: 2 })).toMatchObject({
      ok: false,
      code: "image-only",
    });
    expect(classifyPdfExtract({ text: "Ada", pageCount: 1 }).ok).toBe(false);
    const readable = classifyPdfExtract({
      text: "Ada Lovelace\nada@example.com\nEngineer",
      pageCount: 1,
    });
    expect(readable.ok).toBe(true);
    expect(readable.text).toMatch(/Ada Lovelace/);
  });

  it("structures text with an injected generator and skips empty text", async () => {
    const idle = vi.fn();
    const empty = await structureResumeText("  ", { generate: idle });
    expect(empty).toMatchObject({ ok: false, reason: "empty" });
    expect(idle).not.toHaveBeenCalled();

    const generate = vi.fn(async ({ system, user }) => {
      expect(system).toMatch(/STRICT JSON/);
      expect(user).toContain("Ada Lovelace");
      expect(user).toContain("ada@example.com");
      expect(user).not.toMatch(/cavren|localhost/i);
      return JSON.stringify(samplePayload);
    });
    const result = await structureResumeText(FIXTURE, { generate, external: false });
    expect(generate).toHaveBeenCalledOnce();
    expect(result.ok).toBe(true);
    expect(result.source).toBe("ai");
    expect(result.data.personalDetails.email).toBe("ada@example.com");
    expect(result.data.workHistory[0].positionTitle).toBe("Engineer");

    const rejected = await structureResumeText(FIXTURE, {
      generate: async () => "I can't help with that.",
    });
    expect(rejected.ok).toBe(false);
  });

  it("redacts contact details for an external provider and restores them locally", async () => {
    const generate = vi.fn(async ({ user }) => {
      expect(user).not.toContain("ada@example.com");
      expect(user).toContain("[email]");
      return JSON.stringify({
        personalDetails: {
          firstName: "Ada",
          lastName: "Lovelace",
          designation: "Analyst",
          email: "[email]",
        },
        workHistory: [
          {
            positionTitle: "Engineer",
            companyName: "Analytical Engine Co",
            bullets: ["Shipped the notes"],
          },
        ],
      });
    });
    const result = await structureResumeText(FIXTURE, { generate, external: true });
    expect(result.ok).toBe(true);
    expect(result.data.personalDetails.email).toBe("ada@example.com");
    expect(result.data.workHistory[0].companyName).toBe("Analytical Engine Co");
  });
});

describe("automatic resume import", () => {
  beforeEach(() => {
    aiMocks.enabled = false;
    aiMocks.aiGenerate.mockReset();
    aiMocks.isAiAvailable.mockReset();
    aiMocks.isAiAvailable.mockReturnValue(false);
  });

  it("calls the configured provider and keeps the mapped resume", async () => {
    aiMocks.enabled = true;
    aiMocks.isAiAvailable.mockReturnValue(true);
    aiMocks.aiGenerate.mockImplementation(async ({ system, user }) => {
      expect(system).toMatch(/STRICT JSON/);
      expect(user).toContain("Ada Lovelace");
      expect(user).toContain("ada@example.com");
      return JSON.stringify(samplePayload);
    });

    const result = await parseResumeImport(FIXTURE);
    expect(aiMocks.aiGenerate).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      ok: true,
      source: "ai",
      attemptedAi: true,
      aiFailed: false,
    });
    expect(result.data.personalDetails.email).toBe("ada@example.com");
    expect(result.data.workHistory[0].positionTitle).toBe("Engineer");
    expect(result.data.latexSource).toBeUndefined();
    expect(result.data.resumeSettings).toBeUndefined();
  });

  it("falls back to the local read when the provider throws", async () => {
    aiMocks.enabled = true;
    aiMocks.isAiAvailable.mockReturnValue(true);
    aiMocks.aiGenerate.mockRejectedValue(new Error("provider down"));

    const result = await parseResumeImport(FIXTURE);
    expect(result.ok).toBe(true);
    expect(result.source).toBe("local");
    expect(result.aiFailed).toBe(true);
    expect(result.aiReason).toBe("provider down");
    expect(result.data.personalDetails.email).toBe("ada@example.com");
    expect(result.data.workHistory[0].companyName).toMatch(/Analytical Engine/);
  });

  it("falls back to the local read when model output is rejected", async () => {
    aiMocks.enabled = true;
    aiMocks.isAiAvailable.mockReturnValue(true);
    aiMocks.aiGenerate.mockResolvedValue("I can't help with that.");

    const result = await parseResumeImport(FIXTURE);
    expect(result.ok).toBe(true);
    expect(result.source).toBe("local");
    expect(result.aiFailed).toBe(true);
    expect(result.aiReason).toBe("not-object");
    expect(result.data.personalDetails.firstName).toBe("Ada");
  });

  it("stays on the local read when AI is not configured", async () => {
    aiMocks.enabled = true;
    aiMocks.isAiAvailable.mockReturnValue(false);

    const result = await parseResumeImport(FIXTURE);
    expect(aiMocks.aiGenerate).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: true,
      source: "local",
      attemptedAi: false,
      aiFailed: false,
    });
  });

  it("redacts contact details for an external provider and restores them", async () => {
    const generate = vi.fn(async ({ user }) => {
      expect(user).not.toContain("ada@example.com");
      expect(user).toContain("[email]");
      return JSON.stringify({
        personalDetails: {
          firstName: "Ada",
          lastName: "Lovelace",
          designation: "Analyst",
          email: "[email]",
        },
        workHistory: [
          {
            positionTitle: "Engineer",
            companyName: "Analytical Engine Co",
            bullets: ["Shipped the notes"],
          },
        ],
      });
    });

    const empty = await parseResumeImport("  ", { generate });
    expect(empty.attemptedAi).toBe(false);
    expect(generate).not.toHaveBeenCalled();

    const result = await parseResumeImport(FIXTURE, { generate, external: true });
    expect(generate).toHaveBeenCalledOnce();
    expect(result.ok).toBe(true);
    expect(result.source).toBe("ai");
    expect(result.data.personalDetails.email).toBe("ada@example.com");
  });
});
