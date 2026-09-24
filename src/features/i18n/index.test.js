import { describe, expect, it } from "vitest";
import { t, setLocale, getLocale } from "./index.js";

describe("i18n", () => {
  it("translates English keys", () => {
    setLocale("en");
    expect(t("nav.features")).toBe("Features");
    expect(t("steps.experience")).toBe("Experience");
  });

  it("falls back for missing Hindi keys", () => {
    setLocale("hi");
    expect(getLocale()).toBe("hi");
    expect(t("nav.start")).toMatch(/शुरू/);
    expect(t("missing.key")).toBe("missing.key");
    setLocale("en");
  });

  it("supports Spanish", () => {
    setLocale("es");
    expect(t("nav.features")).toBe("Funciones");
    expect(t("backup.encryptedTitle")).toMatch(/Cifrada|cifrada/i);
    setLocale("en");
  });
});
