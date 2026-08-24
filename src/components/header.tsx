"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav className="celestial-nav" aria-label={t("navLabel")}>
          <Link
            href="/"
            className="celestial-nav__brand"
            aria-label={t("home")}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <span className="nav-orb nav-orb--sun" aria-hidden="true" />
            <span className="celestial-nav__brand-name">MingZhe</span>
          </Link>

          <span className="celestial-nav__orbit" aria-hidden="true" />

          <Link
            href="/blog"
            className="celestial-nav__destination"
            aria-label={t("articles")}
            aria-current={isActive("/blog") ? "page" : undefined}
          >
            <span className="nav-orb nav-orb--cluster" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>{t("articles")}</span>
          </Link>

          <Link
            href="/about"
            className="celestial-nav__destination"
            aria-label={t("about")}
            aria-current={isActive("/about") ? "page" : undefined}
          >
            <span className="nav-orb nav-orb--comet" aria-hidden="true" />
            <span>{t("about")}</span>
          </Link>
        </nav>

        <div className="celestial-tools">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
