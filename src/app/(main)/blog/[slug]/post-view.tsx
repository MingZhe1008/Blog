"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { MDXContent } from "@/components/mdx-renderer";
import { GiscusComments } from "@/components/giscus";
import { TableOfContents } from "@/components/toc";
import type { Article } from "@/lib/data";

export function PostView({
  article,
  prev,
  next,
}: {
  article: Article;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}) {
  const t = useTranslations("post");

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-block font-ui text-xs text-text-muted hover:text-accent transition-colors mb-12"
        >
          {t("backToArticles")}
        </Link>

        <div className="flex gap-10 lg:gap-16">
          {/* Main content */}
          <article className="flex-1 min-w-0 max-w-[640px]">
            <header className="mb-12">
              <p className="font-ui text-xs text-text-muted tracking-wide uppercase mb-3">
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-black text-text-primary leading-tight mb-4">
                {article.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {(article.tags ?? []).map((tag) => (
                  <a
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="font-ui text-xs text-accent bg-accent/10 px-2.5 py-0.5 rounded-full hover:bg-accent/20 transition-colors"
                  >
                    #{tag}
                  </a>
                ))}
                <span className="font-ui text-xs text-text-muted ml-auto">
                  ~{Math.ceil((article.content.length || 0) / 1500)}{" "}
                  {t("minRead", { defaultValue: "min read" })}
                </span>
              </div>
            </header>

            <MDXContent source={article.content} />

            <hr className="my-16" />

            <nav className="grid grid-cols-2 gap-8">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="group p-4 rounded-lg border border-border hover:border-border-hover transition-colors"
                >
                  <span className="font-ui text-xs text-text-muted">← {t("previous")}</span>
                  <p className="font-ui text-sm text-text-secondary group-hover:text-accent transition-colors mt-1 line-clamp-1">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="group p-4 rounded-lg border border-border hover:border-border-hover transition-colors text-right"
                >
                  <span className="font-ui text-xs text-text-muted">{t("next")} →</span>
                  <p className="font-ui text-sm text-text-secondary group-hover:text-accent transition-colors mt-1 line-clamp-1">
                    {next.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </nav>

            <section className="mt-16 pt-12 border-t border-border">
              <h2 className="font-display text-lg font-bold mb-6">{t("thoughts")}</h2>
              <GiscusComments />
            </section>
          </article>

          {/* Sidebar — TOC */}
          <aside className="hidden lg:block w-56 shrink-0">
            <TableOfContents content={article.content} />
          </aside>
        </div>
      </div>
    </main>
  );
}
