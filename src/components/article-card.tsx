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
          ? "bg-bg-surface border border-border rounded-lg overflow-hidden hover:border-border-hover hover:bg-bg-elevated transition-all duration-300"
          : "py-6 border-b border-border"
      }`}
    >
      <Link href={`/blog/${article.slug}`} className={`block ${isGrid ? "" : "sm:flex sm:gap-5"}`}>
        {/* 封面图 */}
        {article.coverImage && (
          <div
            className={`overflow-hidden bg-bg-elevated ${
              isGrid
                ? "w-full aspect-video -mx-6 -mt-6 mb-5"
                : "w-full sm:w-40 sm:shrink-0 mb-3 sm:mb-0 rounded-md"
            }`}
          >
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}
        <div className={isGrid ? "px-6 pb-6" : ""}>
          <p className="font-ui text-xs text-text-muted mb-1.5 tracking-wide uppercase">
            {new Date(article.createdAt).toLocaleDateString("zh-CN", {
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
                {t}
              </span>
            ))}
            <span className="font-ui text-xs text-text-muted ml-auto">
              ~{Math.ceil((article.content.length || 0) / 1500)} min read
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
