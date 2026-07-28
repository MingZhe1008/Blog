"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/data";

export function HomeView({ articles }: { articles: Article[] }) {
  const t = useTranslations("home");

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-xl mx-auto px-6 pt-32 pb-20 text-center">
        <p className="font-ui text-text-muted text-sm mb-6 tracking-widest uppercase">
          {t("greeting")}
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-black text-accent mb-5">
          MingZhe
        </h1>
        <p className="font-body text-text-secondary text-lg max-w-md mx-auto leading-relaxed">
          {t("bio")}
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="https://github.com/MingZhe1008"
            className="font-ui text-sm text-text-secondary hover:text-accent transition-colors"
          >
            {t("github")}
          </Link>
          <Link
            href="/blog"
            className="font-ui text-sm text-text-secondary hover:text-accent transition-colors"
          >
            {t("articles")}
          </Link>
        </div>
      </section>

      {/* Articles grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-display text-lg font-bold text-text-muted">
            {t("recent")}
          </h2>
          <Link
            href="/blog"
            className="font-ui text-xs text-text-muted hover:text-accent transition-colors"
          >
            {t("viewAll")}
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="font-ui text-text-muted text-sm text-center py-20">
            {t("noArticles")}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} variant="grid" />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-8 text-center">
        <p className="font-ui text-xs text-text-muted">
          © {new Date().getFullYear()} · Built with curiosity
        </p>
      </footer>
    </main>
  );
}
