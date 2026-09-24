import { describe, expect, it } from "vitest";
import { parseResumeBackup, buildBackupPack } from "./backup.js";

describe("backup", () => {
  it("parses resume envelopes", () => {
    const env = {
      type: "resume-builder/resume",
      version: 1,
      doc: {
        name: "Ada",
        data: { personalDetails: { firstName: "Ada" } },
      },
    };
    const parsed = parseResumeBackup(JSON.stringify(env));
    expect(parsed.ok).toBe(true);
    expect(parsed.kind).toBe("resume");
    expect(parsed.doc.data.personalDetails.firstName).toBe("Ada");
  });

  it("builds a pack", () => {
    const pack = buildBackupPack([
      {
        id: "1",
        name: "A",
        createdAt: 1,
        updatedAt: 2,
        data: { personalDetails: {} },
      },
    ]);
    expect(pack.type).toBe("cavren/backup-pack");
    expect(pack.resumes).toHaveLength(1);
  });

  it("rejects garbage", () => {
    expect(parseResumeBackup("not-json").ok).toBe(false);
  });
});
