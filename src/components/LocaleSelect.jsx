import { useI18n } from "@features/i18n/useI18n";

/**
 * Compact language select for React surfaces (dashboard, editor).
 * Reloads so Astro marketing pages pick up the cookie too.
 */
const LocaleSelect = ({ className = "" }) => {
  const { locale, setLocale, locales, t } = useI18n();

  return (
    <label className={`locale-picker locale-picker-app ${className}`.trim()}>
      <span className="visually-hidden">{t("a11y.locale")}</span>
      <select
        aria-label={t("a11y.locale")}
        value={locale}
        onChange={(event) => {
          setLocale(event.target.value);
          window.location.reload();
        }}
      >
        {locales.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LocaleSelect;
