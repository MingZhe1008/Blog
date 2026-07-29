"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 min-h-screen bg-bg-surface border-r border-border p-6 flex flex-col gap-2">
        <Link
          href="/admin"
          className="font-display text-accent text-xl font-black mb-4 hover:text-accent-hover transition-colors"
        >
          {t("title")}
        </Link>
        <nav className="flex flex-col gap-1">
          <SidebarLink href="/admin">{t("articles")}</SidebarLink>
          <SidebarLink href="/admin/editor">{t("newPost")}</SidebarLink>
          <SidebarLink href="/admin/import">{t("importMD")}</SidebarLink>
          <SidebarLink href="/admin/images">{t("images")}</SidebarLink>
        </nav>
        <div className="mt-auto pt-4 border-t border-border">
          <Link
            href="/"
            className="font-ui text-text-muted text-sm hover:text-accent transition-colors"
          >
            {t("backToBlog")}
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-ui text-text-secondary text-sm px-3 py-2 rounded-md hover:bg-bg-elevated hover:text-text-primary transition-colors"
    >
      {children}
    </Link>
  );
}
