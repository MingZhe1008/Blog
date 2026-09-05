"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
export function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();
  return <header className="site-header"><div className="site-header__inner editorial-nav">
    <Link href="/" className="wordmark" aria-label="MingZhe">MingZhe<span>.</span></Link>
    <nav className="text-navigation" aria-label={t("navLabel")}>{[["/", "home"], ["/blog", "articles"], ["/about", "about"]].map(([href, key]) => <Link key={href} href={href} aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}>{t(key)}</Link>)}</nav>
    <div className="celestial-tools"><LocaleSwitcher /><ThemeToggle /></div>
  </div></header>;
}
