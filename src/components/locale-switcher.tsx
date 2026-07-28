"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("locale");
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function toggle() {
    const next = locale === "zh" ? "en" : "zh";
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <button
      onClick={toggle}
      className="font-ui text-xs text-text-muted hover:text-accent transition-colors px-2 py-1"
      title={t("switchTo")}
    >
      {locale === "zh" ? "EN" : "中"}
    </button>
  );
}
