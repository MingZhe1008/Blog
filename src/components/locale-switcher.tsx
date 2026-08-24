"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const label = locale === "zh" ? "Switch to English" : "切换到中文";

  function toggle() {
    const next = locale === "zh" ? "en" : "zh";
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${365 * 24 * 60 * 60}`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="celestial-control locale-switcher"
      title={label}
      aria-label={label}
    >
      <span className="locale-switcher__reticle" aria-hidden="true" />
      <span className="locale-switcher__code">{locale === "zh" ? "EN" : "中"}</span>
    </button>
  );
}
