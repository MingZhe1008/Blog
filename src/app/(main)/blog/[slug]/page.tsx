import { getArticleBySlug, getAdjacentArticles } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXContent } from "@/components/mdx-renderer";
import { GiscusComments } from "@/components/giscus";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      tags: article.tags ?? [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("post");
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") notFound();

  const { prev, next } = await getAdjacentArticles(slug);

  return (
    <main className="min-h-screen">
      <article className="max-w-2xl mx-auto px-6 pt-8 pb-24">
        <Link
          href="/blog"
          className="inline-block font-ui text-xs text-text-muted hover:text-accent transition-colors mb-12"
        >
          {t("backToArticles")}
        </Link>

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
            {(article.tags ?? []).map((t) => (
              <a
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className="font-ui text-xs text-accent bg-accent/10 px-2.5 py-0.5 rounded-full hover:bg-accent/20 transition-colors"
              >
                #{t}
              </a>
            ))}
            <span className="font-ui text-xs text-text-muted ml-auto">
              ~{Math.ceil((article.content.length || 0) / 1500)} {t("minRead", { defaultValue: "min read" })}
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
    </main>
  );
}
