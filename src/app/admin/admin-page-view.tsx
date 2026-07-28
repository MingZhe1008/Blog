"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { AdminActions } from "./admin-actions";
import type { Article } from "@/lib/data";

export function AdminPageView({ articles }: { articles: Article[] }) {
  const t = useTranslations("admin");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-black">{t("articles")}</h1>
        <Link
          href="/admin/editor"
          className="font-ui text-sm px-4 py-2 bg-accent text-bg-base font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          + {t("newPost")}
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="font-ui text-text-muted text-sm">{t("noArticles")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border font-ui text-text-secondary text-left">
                <th className="py-3 pr-4 font-medium">{t("title_col")}</th>
                <th className="py-3 pr-4 font-medium">{t("status")}</th>
                <th className="py-3 pr-4 font-medium">{t("tags")}</th>
                <th className="py-3 pr-4 font-medium">{t("updated")}</th>
                <th className="py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-bg-surface transition-colors">
                  <td className="py-3 pr-4 font-medium">{a.title}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-ui border ${
                        a.status === "published"
                          ? "bg-bg-muted text-text-secondary border-border"
                          : "text-text-muted border-border/50"
                      }`}
                    >
                      {a.status === "published" ? t("published") : t("draft")}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-1 flex-wrap">
                      {(a.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-text-muted bg-bg-muted px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-text-muted font-ui whitespace-nowrap">
                    {new Date(a.updatedAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="py-3 font-ui whitespace-nowrap">
                    <Link
                      href={`/admin/editor/${a.id}`}
                      className="text-accent hover:text-accent-hover mr-3 transition-colors"
                    >
                      {t("edit")}
                    </Link>
                    <AdminActions
                      articleId={a.id}
                      confirmMsg={t("confirmDelete")}
                      deleteLabel={t("delete")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
