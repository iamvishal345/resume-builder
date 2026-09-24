import { useSyncExternalStore } from "react";
import {
  getLocale,
  setLocale,
  subscribeLocale,
  t,
  listLocales,
} from "./index.js";

export const useI18n = () => {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocale,
    () => "en",
  );
  return {
    locale,
    setLocale,
    t,
    locales: listLocales(),
  };
};
