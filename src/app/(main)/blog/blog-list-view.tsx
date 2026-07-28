"use client";

import { useTranslations } from "next-intl";
import { ArticleCard } from "@/components/article-card";
import { TagFilter } from "@/components/tag-filter";
import type { Article } from "@/lib/data";

export function BlogListView({
  articles,
  tags,
  activeTag,
  page,
  totalPages,
}: {
  articles: Article[];
  tags: string[];
  activeTag?: string;
  page: number;
  totalPages: number;
}) {
  const t = useTranslations("blog");

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-24">
        <h1 className="font-display text-3xl font-black mb-8">{t("title")}</h1>

        <TagFilter tags={tags} activeTag={activeTag} allLabel={t("all")} />

        {articles.length === 0 ? (
          <p className="font-ui text-text-muted text-sm text-center py-12">
            {t("noArticles")}
          </p>
        ) : (
          <>
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              {page > 1 ? (
                <a
                  href={`/blog?${activeTag ? `tag=${activeTag}&` : ""}page=${page - 1}`}
                  className="font-ui text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  {t("newer")}
                </a>
              ) : (
                <span />
              )}
              {page < totalPages && (
                <a
                  href={`/blog?${activeTag ? `tag=${activeTag}&` : ""}page=${page + 1}`}
                  className="font-ui text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  {t("older")}
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
