"use client";

import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import { useSetLocale } from "./i18n-provider";

export function LocaleSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const label = locale === "zh" ? "Switch to English" : "切换到中文";

  function toggle() {
    const next = locale === "zh" ? "en" : "zh";
    setLocale(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="celestial-control locale-switcher"
      title={label}
      aria-label={label}
    >
      <Languages size={17} strokeWidth={1.6} aria-hidden="true" />
      <span className="locale-switcher__code">{locale === "zh" ? "EN" : "中"}</span>
    </button>
  );
}
