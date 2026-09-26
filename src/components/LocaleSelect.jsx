import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { useI18n } from "@features/i18n/useI18n";
import { Languages } from "lucide-react";

/**
 * Compact language selector using Astryx DropdownMenu.
 * Reloads on change so Astro pages pick up the cookie as well.
 */
const LocaleSelect = ({ className = "" }) => {
  const { locale, setLocale, locales, t } = useI18n();

  const currentOpt = locales.find((o) => o.id === locale) || locales[0];

  const items = locales.map((opt) => ({
    label: opt.label,
    onClick: () => {
      setLocale(opt.id);
      window.location.reload();
    },
  }));

  return (
    <div className={`locale-picker-app ${className}`.trim()}>
      <DropdownMenu
        button={{
          variant: "ghost",
          size: "sm",
          label: currentOpt?.label || "Language",
          icon: <Languages size={15} />,
        }}
        items={items}
      />
    </div>
  );
};

export default LocaleSelect;
