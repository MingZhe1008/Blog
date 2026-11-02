"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Article } from "@/lib/data";
import { GitHubLink } from "@/components/github-link";
import { ReadingExcerpt } from "@/components/reading-excerpt";
import type { ReadingExcerpt as Excerpt } from "@/lib/reading-excerpts";
import { useHeroEntrance } from "@/components/use-hero-entrance";

export function HomeView({ articles, excerpts, previewMotion = false }: { articles: Article[]; excerpts: Excerpt[]; previewMotion?: boolean }) {
  const heroRef = useHeroEntrance(previewMotion);
  const t = useTranslations("home");
  const topics = [...new Set(articles.flatMap(a => a.tags ?? []))].slice(0, 8);
  return <main className="editorial-page">
    <section ref={heroRef} className="editorial-hero">
      <div>
        <h1>Ming<span>Zhe.</span></h1>
        <p className="hero-intro">{t("bio")}</p>
        <div className="hero-actions"><Link className="primary-link" href="/articles">{t("articles")}</Link><GitHubLink /></div>
      </div>
      <aside className="hero-note"><span className="eyebrow">{t("notebook")}</span><p>{t("note")}</p><span className="note-signature">MingZhe / 2026</span></aside>
    </section>
    <ReadingExcerpt key={JSON.stringify(excerpts)} excerpts={excerpts} />
    {topics.length > 0 && <section className="topics-section"><p className="eyebrow">{t("topics")}</p><div className="topic-links">{topics.map(tag => <Link key={tag} href={`/articles?tag=${encodeURIComponent(tag)}`}>{tag}</Link>)}</div></section>}
  </main>;
}
