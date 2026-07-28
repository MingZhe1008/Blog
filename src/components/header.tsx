"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo.jpg"
              alt="Logo"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-ui text-text-primary text-lg font-bold tracking-tight">
              MingZhe
            </span>
          </Link>

          <nav className="flex items-center gap-5">
            <Link
              href="/blog"
              className="font-ui text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("articles")}
            </Link>
            <Link
              href="/about"
              className="font-ui text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("about")}
            </Link>
          </nav>
        </div>

        {/* Right: tools */}
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
