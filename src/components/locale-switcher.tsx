"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function toggle() {
    const next = locale === "zh" ? "en" : "zh";
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${365 * 24 * 60 * 60}`;
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className="font-ui text-xs text-text-muted hover:text-accent transition-colors px-2 py-1"
      title={locale === "zh" ? "Switch to English" : "切换到中文"}
    >
      {locale === "zh" ? "EN" : "中"}
    </button>
  );
}
