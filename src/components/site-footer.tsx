"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
export function SiteFooter() {
  const t = useTranslations("common");
  return <footer className="editorial-footer"><Link href="/" className="wordmark">MingZhe<span>.</span></Link><p>© {new Date().getFullYear()} · {t("poweredBy")}</p><a href="https://github.com/MingZhe1008" target="_blank" rel="noopener noreferrer">GitHub ↗</a></footer>;
}
