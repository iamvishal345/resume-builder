import en from "./locales/en.js";
import hi from "./locales/hi.js";
import es from "./locales/es.js";

const LOCALES = { en, hi, es };
const STORAGE_KEY = "cavren-locale";
const COOKIE = "cavren-locale";

export const LOCALE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "hi", label: "हिन्दी" },
];

const htmlLang = (code) => {
  if (code === "hi") return "hi";
  if (code === "es") return "es";
  return "en";
};

const readCookie = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )cavren-locale=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (code) => {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${encodeURIComponent(code)};path=/;max-age=31536000;SameSite=Lax`;
};

const getStored = () => {
  try {
    if (typeof localStorage !== "undefined") {
      const ls = localStorage.getItem(STORAGE_KEY);
      if (ls) return ls;
    }
  } catch {
    /* private mode */
  }
  return readCookie();
};

let current = "en";
const boot = getStored();
if (boot && LOCALES[boot]) current = boot;

const listeners = new Set();

export const getLocale = () => current;

export const listLocales = () =>
  LOCALE_OPTIONS.filter((o) => LOCALES[o.id]);

/** Set active locale for this render (SSR) without persisting. */
export const useLocale = (code) => {
  if (LOCALES[code]) current = code;
  return current;
};

export const setLocale = (code) => {
  if (!LOCALES[code]) return current;
  current = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* private mode */
  }
  writeCookie(code);
  if (typeof document !== "undefined") {
    document.documentElement.lang = htmlLang(code);
  }
  listeners.forEach((fn) => fn(current));
  return current;
};

export const subscribeLocale = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const lookup = (dict, key) => {
  const parts = String(key).split(".");
  let cur = dict;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : undefined;
};

export const t = (key, vars) => {
  const dict = LOCALES[current] || en;
  let out = lookup(dict, key) ?? lookup(en, key) ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  return out;
};

export const applyDocumentLocale = () => {
  if (typeof document === "undefined") return;
  document.documentElement.lang = htmlLang(current);
};

/** Resolve locale from Astro cookies / request. */
export const resolveRequestLocale = (cookieValue) => {
  const code = cookieValue && LOCALES[cookieValue] ? cookieValue : "en";
  useLocale(code);
  return code;
};
