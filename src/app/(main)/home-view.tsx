"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/data";

export function HomeView({ articles }: { articles: Article[] }) {
  const t = useTranslations("home");
  const blog = useTranslations("blog");
  const locale = useLocale();
  const topics = [...new Set(articles.flatMap(a => a.tags ?? []))].slice(0, 8);
  return <main className="editorial-page">
    <section className="editorial-hero">
      <div><p className="eyebrow">{t("greeting")} · PERSONAL JOURNAL</p>
        <h1>Ming<span>Zhe.</span></h1>
        <p className="hero-intro">{t("bio")}</p>
        <div className="hero-actions"><Link className="primary-link" href="/blog">{t("articles")} ↗</Link><a href="https://github.com/MingZhe1008" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
      </div>
      <aside className="hero-note"><span className="eyebrow">{t("notebook")}</span><p>{t("note")}</p><span className="note-signature">MingZhe / 2026</span></aside>
    </section>
    {articles[0] && <section className="featured-section"><div className="section-heading"><p className="eyebrow">{t("spotlight")}</p><span>01 / JOURNAL</span></div><ArticleCard article={articles[0]} variant="featured" locale={locale} minReadLabel={blog("minRead")} /></section>}
    <section className="recent-section"><div className="section-heading"><h2>{t("recent")}</h2><Link href="/blog">{t("viewAll")}</Link></div>
      {articles.length ? <div className="article-grid">{articles.slice(1).map(a => <ArticleCard key={a.id} article={a} variant="grid" locale={locale} minReadLabel={blog("minRead")} />)}{articles.length === 1 && <p className="empty-message">{t("moreSoon")}</p>}</div> : <p className="empty-message">{t("noArticles")}</p>}
    </section>
    {topics.length > 0 && <section className="topics-section"><p className="eyebrow">{t("topics")}</p><div className="topic-links">{topics.map(tag => <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>{tag} ↗</Link>)}</div></section>}
  </main>;
}
