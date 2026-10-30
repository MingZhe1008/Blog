"use client";

import "./admin.css";

import { useTranslations } from "next-intl";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, FolderKanban, NotebookPen, Quote, Import, Images, ArrowLeft, Layers } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link
          href="/admin"
          className="admin-brand"
        >
          <Layers size={22} />{t("title")}
        </Link>
        <nav className="flex flex-col gap-1">
          <SidebarLink href="/admin"><FileText size={17} />{t("articles")}</SidebarLink>
          <SidebarLink href="/admin/projects"><FolderKanban size={17} />项目管理</SidebarLink>
          <SidebarLink href="/admin/notes"><NotebookPen size={17} />{t("notes")}</SidebarLink>
          <SidebarLink href="/admin/excerpts"><Quote size={17} />{t("excerpts")}</SidebarLink>
          <SidebarLink href="/admin/import"><Import size={17} />{t("importMD")}</SidebarLink>
          <SidebarLink href="/admin/images"><Images size={17} />{t("images")}</SidebarLink>
        </nav>
        <div className="mt-auto pt-4 border-t border-border">
          <Link
            href="/"
            className="admin-back-link"
          >
            <ArrowLeft size={16} />{t("backToBlog").replace(/^←\s*/, "")}
          </Link>
        </div>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = href === "/admin" ? pathname === href || pathname.startsWith("/admin/editor") : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      aria-current={active ? "page" : undefined}
      className="font-ui text-text-secondary text-sm px-3 py-2 rounded-md hover:bg-bg-elevated hover:text-text-primary transition-colors"
    >
      <SidebarLabel>{children}</SidebarLabel>
    </Link>
  );
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return <span className="admin-nav-label" aria-busy={pending}>{children}{pending && <span className="admin-spinner" aria-hidden="true" />}</span>;
}
