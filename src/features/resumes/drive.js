// Client-side Google Drive backup/restore. Tokens stay in the browser.
// Uses Google Identity Services (GIS) for OAuth2 popup flow and direct Drive v3 REST APIs.
import { getGoogleClientId } from "./prefs";
import { buildBackupPack } from "./backup";

const SCOPES = "https://www.googleapis.com/auth/drive.file";
const FILE_NAME = "cavren-backup.cavren.json";

let tokenClient = null;
let accessToken = null;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (typeof document === "undefined") return resolve();
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

export const isDriveConfigured = () => Boolean(getGoogleClientId());

export const initDrive = async () => {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error("Add a Google OAuth client ID in Data & privacy.");
  if (!navigator.onLine) throw new Error("Drive needs a network connection.");

  await loadScript("https://accounts.google.com/gsi/client");

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services script failed to initialize.");
  }

  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: () => {},
    });
  }
};

const ensureToken = () =>
  new Promise((resolve, reject) => {
    if (accessToken) {
      resolve(accessToken);
      return;
    }
    if (!tokenClient) {
      reject(new Error("Drive is not initialized."));
      return;
    }
    tokenClient.callback = (resp) => {
      if (resp.error) {
        reject(
          new Error(
            resp.error_description || resp.error || "Google authentication failed.",
          ),
        );
        return;
      }
      accessToken = resp.access_token;
      resolve(accessToken);
    };
    tokenClient.requestAccessToken({ prompt: "consent" });
  });

const findBackupFile = async (token) => {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name,modifiedTime)&pageSize=1`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(
      errJson.error?.message || `Drive search failed (${res.status}).`,
    );
  }
  const data = await res.json();
  return data.files?.[0] || null;
};

export const uploadBackupToDrive = async (docsOrPack, extras) => {
  await initDrive();
  const token = await ensureToken();
  const pack =
    docsOrPack && docsOrPack.version && Array.isArray(docsOrPack.resumes)
      ? docsOrPack
      : buildBackupPack(docsOrPack, extras);
  const body = JSON.stringify(pack, null, 2);
  const existing = await findBackupFile(token);

  if (existing) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      },
    );
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || "Drive upload failed.");
    }
    return { id: existing.id, updated: true };
  }

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const metadata = {
    name: FILE_NAME,
    mimeType: "application/json",
  };

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    body +
    close_delim;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    },
  );

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || "Drive upload failed.");
  }
  const json = await res.json();
  return { id: json.id, updated: false };
};

export const downloadBackupFromDrive = async () => {
  await initDrive();
  const token = await ensureToken();
  const existing = await findBackupFile(token);
  if (!existing) {
    throw new Error(
      "No Cavren backup file (cavren-backup.cavren.json) found in your Google Drive.",
    );
  }
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || "Drive download failed.");
  }
  return res.text();
};

export const signOutDrive = () => {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  tokenClient = null;
};
