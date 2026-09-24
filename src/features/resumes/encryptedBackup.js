/**
 * Passphrase-encrypted Cavren backup packs (client-only Web Crypto).
 * Format is intentional opaque JSON — restore needs the same passphrase.
 */
const ENC_TYPE = "cavren/encrypted-backup";
const ENC_VERSION = 1;
const ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const te = () => new TextEncoder();
const td = () => new TextDecoder();

const b64 = (buf) => {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};

const fromB64 = (str) => {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const requireCrypto = () => {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto is not available in this environment.");
  }
};

const deriveKey = async (passphrase, salt, usages) => {
  const base = await crypto.subtle.importKey(
    "raw",
    te().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    usages,
  );
};

export const isEncryptedBackup = (raw) =>
  raw &&
  typeof raw === "object" &&
  raw.type === ENC_TYPE &&
  typeof raw.ciphertext === "string";

export const parseEncryptedBackupText = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not valid JSON." };
  }
  if (!isEncryptedBackup(parsed)) {
    return { ok: false, error: "This file is not an encrypted Cavren backup." };
  }
  return { ok: true, envelope: parsed };
};

/**
 * @param {object} pack - Plain cavren/backup-pack object
 * @param {string} passphrase
 * @returns {Promise<object>} encrypted envelope
 */
export const encryptBackupPack = async (pack, passphrase) => {
  requireCrypto();
  const pass = String(passphrase || "");
  if (pass.length < 8) {
    throw new Error("Passphrase must be at least 8 characters.");
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(pass, salt, ["encrypt"]);
  const plain = te().encode(JSON.stringify(pack));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plain,
  );
  return {
    type: ENC_TYPE,
    version: ENC_VERSION,
    algo: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: b64(salt),
    iv: b64(iv),
    ciphertext: b64(cipher),
    exportedAt: new Date().toISOString(),
  };
};

/**
 * @param {object} envelope
 * @param {string} passphrase
 * @returns {Promise<object>} decrypted pack
 */
export const decryptBackupPack = async (envelope, passphrase) => {
  requireCrypto();
  if (!isEncryptedBackup(envelope)) {
    throw new Error("Not an encrypted Cavren backup.");
  }
  const pass = String(passphrase || "");
  if (!pass) throw new Error("Passphrase required.");
  const salt = fromB64(envelope.salt);
  const iv = fromB64(envelope.iv);
  const key = await deriveKey(pass, salt, ["decrypt"]);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      fromB64(envelope.ciphertext),
    );
    const parsed = JSON.parse(td().decode(plain));
    if (!parsed || parsed.type !== "cavren/backup-pack") {
      throw new Error("Decrypted file is not a Cavren backup pack.");
    }
    return parsed;
  } catch (e) {
    if (e?.message?.includes("Cavren")) throw e;
    throw new Error("Wrong passphrase or damaged file.");
  }
};

export const ENC_FILE_EXT = ".cavren.enc.json";
