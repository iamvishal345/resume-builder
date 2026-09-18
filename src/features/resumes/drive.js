// Client-side Google Drive backup/restore. Tokens stay in the browser.
// Requires a Google OAuth client ID (user's or PUBLIC_GOOGLE_CLIENT_ID).
import { getGoogleClientId } from "./prefs";
import { buildBackupPack } from "./backup";

const SCOPES = "https://www.googleapis.com/auth/drive.file";
const DISCOVERY = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
const FILE_NAME = "cavren-backup.cavren.json";

let tokenClient = null;
let accessToken = null;
let gapiReady = false;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
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
  await loadScript("https://apis.google.com/js/api.js");

  await new Promise((resolve, reject) => {
    window.gapi.load("client", {
      callback: resolve,
      onerror: () => reject(new Error("Google API failed to load")),
    });
  });

  if (!gapiReady) {
    await window.gapi.client.init({ discoveryDocs: [DISCOVERY] });
    gapiReady = true;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {},
  });
};

const ensureToken = () =>
  new Promise((resolve, reject) => {
    if (accessToken && window.gapi?.client?.getToken()?.access_token) {
      resolve(accessToken);
      return;
    }
    if (!tokenClient) {
      reject(new Error("Drive is not initialized."));
      return;
    }
    tokenClient.callback = (resp) => {
      if (resp.error) {
        reject(new Error(resp.error));
        return;
      }
      accessToken = resp.access_token;
      window.gapi.client.setToken({ access_token: accessToken });
      resolve(accessToken);
    };
    tokenClient.requestAccessToken({ prompt: accessToken ? "" : "consent" });
  });

const findBackupFile = async () => {
  const res = await window.gapi.client.drive.files.list({
    q: `name='${FILE_NAME}' and trashed=false`,
    spaces: "drive",
    fields: "files(id, name, modifiedTime)",
    pageSize: 1,
  });
  return res.result.files?.[0] || null;
};

export const uploadBackupToDrive = async (docs, extras) => {
  await initDrive();
  await ensureToken();
  const pack = buildBackupPack(docs, extras);
  const body = JSON.stringify(pack, null, 2);
  const existing = await findBackupFile();

  if (existing) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body,
      },
    );
    if (!res.ok) throw new Error("Drive upload failed.");
    return { id: existing.id, updated: true };
  }

  const meta = new Blob(
    [JSON.stringify({ name: FILE_NAME, mimeType: "application/json" })],
    { type: "application/json" },
  );
  const file = new Blob([body], { type: "application/json" });
  const form = new FormData();
  form.append("metadata", meta);
  form.append("file", file);
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    },
  );
  if (!res.ok) throw new Error("Drive upload failed.");
  const json = await res.json();
  return { id: json.id, updated: false };
};

export const downloadBackupFromDrive = async () => {
  await initDrive();
  await ensureToken();
  const existing = await findBackupFile();
  if (!existing) throw new Error("No Cavren backup found in Drive.");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error("Drive download failed.");
  return res.text();
};

export const signOutDrive = () => {
  const token = window.gapi?.client?.getToken();
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {});
    window.gapi.client.setToken(null);
  }
  accessToken = null;
};
