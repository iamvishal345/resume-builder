import { describe, expect, it } from "vitest";
import {
  encryptBackupPack,
  decryptBackupPack,
  isEncryptedBackup,
  parseEncryptedBackupText,
} from "./encryptedBackup.js";

const samplePack = {
  type: "cavren/backup-pack",
  version: 1,
  exportedAt: "2026-01-01T00:00:00.000Z",
  resumes: [{ id: "1", name: "Ada", data: { personalDetails: { firstName: "Ada" } } }],
};

describe("encryptedBackup", () => {
  it("round-trips with the correct passphrase", async () => {
    const envelope = await encryptBackupPack(samplePack, "correct-horse");
    expect(isEncryptedBackup(envelope)).toBe(true);
    expect(envelope.ciphertext).toBeTruthy();
    const pack = await decryptBackupPack(envelope, "correct-horse");
    expect(pack.resumes[0].name).toBe("Ada");
  });

  it("rejects a wrong passphrase", async () => {
    const envelope = await encryptBackupPack(samplePack, "correct-horse");
    await expect(decryptBackupPack(envelope, "wrong-pass!")).rejects.toThrow(
      /Wrong passphrase|damaged/i,
    );
  });

  it("parses text envelopes", async () => {
    const envelope = await encryptBackupPack(samplePack, "correct-horse");
    const parsed = parseEncryptedBackupText(JSON.stringify(envelope));
    expect(parsed.ok).toBe(true);
    const pack = await decryptBackupPack(parsed.envelope, "correct-horse");
    expect(pack.type).toBe("cavren/backup-pack");
  });

  it("requires a strong enough passphrase", async () => {
    await expect(encryptBackupPack(samplePack, "short")).rejects.toThrow(/8/);
  });
});
