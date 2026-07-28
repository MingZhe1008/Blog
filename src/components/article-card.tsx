import Link from "next/link";
import type { Article } from "@/lib/data";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group py-6 border-b border-border">
      <Link href={`/blog/${article.slug}`} className="block">
        <p className="font-ui text-xs text-text-muted mb-1.5 tracking-wide uppercase">
          {new Date(article.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h2 className="font-display text-xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors duration-300">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="font-body text-text-secondary text-base leading-relaxed line-clamp-2 mb-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3">
          {(article.tags ?? []).map((t) => (
            <span
              key={t}
              className="font-ui text-xs text-text-muted bg-bg-muted px-2 py-0.5 rounded-full"
            >
              #{t}
            </span>
          ))}
          <span className="font-ui text-xs text-text-muted ml-auto">
            ~{Math.ceil((article.content.length || 0) / 1500)} min read
          </span>
        </div>
      </Link>
    </article>
  );
}
