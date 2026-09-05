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
        <header className="relative mb-12 border-l border-accent/30 pl-6 md:mb-16 md:pl-8">
          <div className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
            {t("fieldLabel")}
          </div>
          <h1 className="mb-4 font-display text-4xl font-black md:text-6xl">{t("title")}</h1>
          <p className="max-w-xl font-body text-base text-text-secondary md:text-lg">
            {t("subtitle")}
          </p>
          <span className="absolute -left-[5px] top-24 h-2 w-2 rounded-full border border-accent bg-bg-base" aria-hidden="true" />
        </header>

        <form action="/blog" className="archive-search">
          {activeTag && <input type="hidden" name="tag" value={activeTag} />}
          <input key={query} name="q" type="search" defaultValue={query} placeholder={common("searchPlaceholder")} aria-label={common("search")} />
          <button type="submit">{common("search")} ↗</button>
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
            <div className="mt-12 flex items-center justify-between border-t border-border/70 pt-6">
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
            </div>
          </>
        )}
      </div>
    </main>
  );
}
