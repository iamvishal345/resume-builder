// Local preferences (localStorage only — never sent anywhere).
const KEYS = {
  demos: "cavren-demos",
  googleClientId: "cavren-google-client-id",
  installDismissed: "cavren-pwa-install-dismissed",
};

const read = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : raw;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, String(value));
  } catch {
    /* private mode */
  }
};

/** @returns {"off"|"once"|"on"} */
export const getDemoMode = () => {
  const v = read(KEYS.demos, "off");
  if (v === "on" || v === "once" || v === "off") return v;
  return "off";
};

export const setDemoMode = (mode) => write(KEYS.demos, mode);

export const getGoogleClientId = () =>
  read(KEYS.googleClientId, "") ||
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_GOOGLE_CLIENT_ID) ||
  "";

export const setGoogleClientId = (id) =>
  write(KEYS.googleClientId, id?.trim() || null);

export const wasInstallDismissed = () => read(KEYS.installDismissed) === "1";
export const dismissInstall = () => write(KEYS.installDismissed, "1");
