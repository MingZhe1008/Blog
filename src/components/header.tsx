"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-accent text-lg font-black tracking-tight hover:text-accent-hover transition-colors"
        >
          Blog
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/blog"
            className="font-ui text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {t("articles")}
          </Link>
          <LocaleSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
