import Link from "next/link";
import type { Article } from "@/lib/data";

export function ArticleCard({
  article,
  variant = "list",
  locale = "zh-CN",
  minReadLabel = "min read",
}: {
  article: Article;
  variant?: "list" | "grid";
  locale?: string;
  minReadLabel?: string;
}) {
  const isGrid = variant === "grid";
  const readingMinutes = Math.ceil((article.content.length || 0) / 1500);
  const publishedAt = new Date(article.createdAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <article className={`group relative ${isGrid ? "h-full" : "border-b border-border/70"}`}>
      <Link
        href={`/blog/${article.slug}`}
        className={`relative block overflow-hidden transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          isGrid
            ? "h-full border border-border/70 bg-bg-surface/55 p-6 hover:border-accent/40"
            : "py-8 pl-0 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-7 sm:pl-2"
        }`}
      >
        <div className={`relative z-10 flex items-center justify-center ${isGrid ? "mb-6 h-28" : "mb-5 h-24 sm:mb-0"}`} aria-hidden="true">
          <span className="absolute h-20 w-20 rounded-full border border-accent/20 transition-transform duration-700 group-hover:rotate-45 group-hover:scale-110" />
          <span className="absolute h-10 w-24 -rotate-12 rounded-[50%] border border-text-muted/35 transition-transform duration-700 group-hover:rotate-6" />
          <span className="absolute h-14 w-14 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-accent-hover),var(--color-accent)_26%,rgba(119,232,214,0.16)_55%,transparent_72%)] shadow-[0_0_30px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]" />
          <span className="absolute right-[18%] top-[18%] h-1.5 w-1.5 rounded-full bg-text-primary shadow-[0_0_10px_var(--color-text-primary)]" />
        </div>

        <div className="relative z-10 min-w-0 self-center">
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <span>{publishedAt}</span>
            <span className="h-px flex-1 bg-border transition-colors group-hover:bg-accent/35" />
            <span>OBS-{String(article.id).padStart(3, "0")}</span>
          </div>

          <h2 className={`${isGrid ? "text-xl" : "text-2xl"} mb-2 mt-0 font-display font-bold text-text-primary transition-colors duration-300 group-hover:text-accent`}>
            {article.title}
          </h2>

          {article.excerpt && (
            <p className={`${isGrid ? "line-clamp-3" : "line-clamp-2"} mb-4 font-body text-base leading-relaxed text-text-secondary`}>
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {(article.tags ?? []).slice(0, isGrid ? 3 : undefined).map((tag) => (
              <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                / {tag}
              </span>
            ))}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {readingMinutes} {minReadLabel} · →
            </span>
          </div>
        </div>

        {article.coverImage && (
          <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.14]">
            <img
              src={article.coverImage}
              alt=""
              className="h-full w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
      </Link>
    </article>
  );
}
