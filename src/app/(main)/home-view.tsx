"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/data";

export function HomeView({ articles }: { articles: Article[] }) {
  const t = useTranslations("home");

  const stagger = (i: number) => ({
    animationDelay: `${i * 150}ms`,
  });

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-xl mx-auto px-6 pt-32 pb-20 text-center">
        <p
          className="font-ui text-text-muted text-sm mb-6 tracking-widest uppercase animate-in"
          style={stagger(0)}
        >
          {t("greeting")}
        </p>
        <h1
          className="font-display text-5xl md:text-6xl font-black text-accent mb-5 animate-in"
          style={stagger(1)}
        >
          MingZhe
        </h1>
        <p
          className="font-body text-text-secondary text-lg max-w-md mx-auto leading-relaxed animate-in"
          style={stagger(2)}
        >
          {t("bio")}
        </p>
        <div className="flex justify-center items-center gap-5 mt-8 animate-in" style={stagger(3)}>
          <a
            href="https://github.com/MingZhe1008"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
            title="GitHub"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <Link
            href="/blog"
            className="font-ui text-sm text-text-secondary hover:text-accent transition-colors"
          >
            {t("articles")}
          </Link>
        </div>
      </section>

      {/* Articles grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24 animate-in" style={stagger(4)}>
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
