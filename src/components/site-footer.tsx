"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GitHubLink } from "./github-link";
export function SiteFooter() {
  const t = useTranslations("common");
  return <footer className="editorial-footer"><Link href="/" className="wordmark">MingZhe<span>.</span></Link><p>© {new Date().getFullYear()} · {t("poweredBy")}</p><GitHubLink /></footer>;
}
