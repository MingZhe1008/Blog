import Link from "next/link";
import { ArticleCover } from "./article-cover";
import type { Article } from "@/lib/data";
export function ArticleCard({ article, variant = "list", locale = "zh", minReadLabel = "min read" }: {
  article: Article; variant?: "list" | "grid" | "featured"; locale?: string; minReadLabel?: string;
}) {
  const date = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Shanghai" }).format(new Date(article.createdAt));
  return <article className={`journal-card journal-card--${variant}`}>
    <Link href={`/blog/${article.slug}`} className="journal-card__link">
      {article.coverImage && <ArticleCover key={article.coverImage} src={article.coverImage} />}
      <div className="journal-card__body"><div className="journal-card__meta"><time dateTime={article.createdAt}>{date}</time><span>{Math.max(1, Math.ceil(article.content.length / 1500))} {minReadLabel}</span></div>
      <h2>{article.title}</h2>{article.excerpt && <p>{article.excerpt}</p>}
      <div className="journal-card__bottom"><div>{(article.tags ?? []).slice(0, 4).map(tag => <span className="article-tag" key={tag}>{tag}</span>)}</div></div></div>
    </Link></article>;
}
