"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArticleCard } from "@/components/article-card";
import { TagFilter } from "@/components/tag-filter";
import type { Article } from "@/lib/data";

export function BlogListView({
  articles,
  tags,
  activeTag,
  page,
  totalPages,
  query,
}: {
  articles: Article[];
  tags: string[];
  activeTag?: string;
  page: number;
  totalPages: number;
  query: string;
}) {
  const t = useTranslations("blog");
  const locale = useLocale();
  const common = useTranslations("common");
  const pageHref = (value: number) => "/blog?" + new URLSearchParams({
    ...(activeTag ? { tag: activeTag } : {}),
    ...(query ? { q: query } : {}), page: String(value),
  }).toString();

  return (
    <main className="archive-page relative min-h-screen overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-20 md:pt-28">
        <header className="archive-heading">
          <h1 className="mb-4 font-display text-4xl font-black md:text-6xl">{t("title")}</h1>
          <p className="max-w-xl font-body text-base text-text-secondary md:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <form action="/blog" className="archive-search">
          {activeTag && <input type="hidden" name="tag" value={activeTag} />}
          <input key={query} name="q" type="search" defaultValue={query} placeholder={common("searchPlaceholder")} aria-label={common("search")} />
          <button type="submit">{common("search")}</button>
        </form>
        <TagFilter
          tags={tags}
          activeTag={activeTag}
          allLabel={t("all")}
          ariaLabel={t("filterLabel")}
        />

        {articles.length === 0 ? (
          <p className="py-20 text-center font-mono text-xs uppercase tracking-[0.25em] text-text-muted">
            {query ? common("noResults") : t("noArticles")}
          </p>
        ) : (
          <>
            <section className="relative border-t border-border/70" aria-label={t("title")}>
              {articles.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  locale={locale}
                  minReadLabel={t("minRead")}
                />
              ))}
            </section>
            {totalPages > 1 && <div className="mt-12 flex items-center justify-between border-t border-border/70 pt-6">
              {page > 1 ? (
                <a
                  href={pageHref(page - 1)}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary transition-colors hover:text-accent"
                >
                  {t("newer")}
                </a>
              ) : (
                <span />
              )}
              {page < totalPages && (
                <a
                  href={pageHref(page + 1)}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary transition-colors hover:text-accent"
                >
                  {t("older")}
                </a>
              )}
            </div>}
          </>
        )}
      </div>
    </main>
  );
}
