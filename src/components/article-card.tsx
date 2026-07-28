import Link from "next/link";
import type { Article } from "@/lib/data";

export function ArticleCard({
  article,
  variant = "list",
}: {
  article: Article;
  variant?: "list" | "grid";
}) {
  const isGrid = variant === "grid";

  return (
    <article
      className={`group ${
        isGrid
          ? "bg-bg-surface border border-border rounded-lg p-6 hover:border-border-hover hover:bg-bg-elevated transition-all duration-300"
          : "py-6 border-b border-border"
      }`}
    >
      <Link href={`/blog/${article.slug}`} className="block">
        <p className="font-ui text-xs text-text-muted mb-1.5 tracking-wide uppercase">
          {new Date(article.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h2
          className={`font-display font-bold text-text-primary mb-2 group-hover:text-accent transition-colors duration-300 ${
            isGrid ? "text-lg" : "text-xl"
          }`}
        >
          {article.title}
        </h2>
        {article.excerpt && (
          <p
            className={`font-body text-text-secondary leading-relaxed mb-3 ${
              isGrid ? "text-sm line-clamp-3" : "text-base line-clamp-2"
            }`}
          >
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3">
          {(article.tags ?? []).slice(0, isGrid ? 3 : undefined).map((t) => (
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
