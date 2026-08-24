import Link from "next/link";
import type { CSSProperties } from "react";
import type { Article } from "@/lib/data";

const nodeLayouts = [
  "md:col-span-7 md:pr-10",
  "md:col-span-5 md:translate-y-20 md:pl-5",
  "md:col-start-2 md:col-span-5 md:mt-8",
  "md:col-start-8 md:col-span-5 md:-mt-4",
  "md:col-start-4 md:col-span-6 md:mt-10",
] as const;

const palettes = [
  { core: "#77e8d6", halo: "rgba(119, 232, 214, 0.28)", secondary: "#f4e9c9" },
  { core: "#ffb45b", halo: "rgba(255, 180, 91, 0.28)", secondary: "#ffd9a8" },
  { core: "#a78bfa", halo: "rgba(167, 139, 250, 0.3)", secondary: "#ddd2ff" },
  { core: "#72b8ff", halo: "rgba(114, 184, 255, 0.28)", secondary: "#b9e5ff" },
  { core: "#f08fc2", halo: "rgba(240, 143, 194, 0.26)", secondary: "#ffd3e9" },
] as const;

type GalaxyNodeProps = {
  article: Article;
  index: number;
  locale?: string;
};

export function GalaxyNode({ article, index, locale = "zh-CN" }: GalaxyNodeProps) {
  const palette = palettes[index % palettes.length];
  const date = new Date(article.createdAt);
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
  const style = {
    "--node-core": palette.core,
    "--node-halo": palette.halo,
    "--node-secondary": palette.secondary,
  } as CSSProperties;

  return (
    <article
      className={`galaxy-node group relative min-w-0 ${nodeLayouts[index % nodeLayouts.length]}`}
      style={style}
    >
      <Link
        href={`/blog/${article.slug}`}
        className="galaxy-node__link relative grid min-h-56 grid-cols-[7rem_1fr] items-center gap-5 overflow-visible py-7 text-left outline-none sm:grid-cols-[9rem_1fr] sm:gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent focus-visible:[&_.galaxy-node__visual]:ring-2 focus-visible:[&_.galaxy-node__visual]:ring-accent focus-visible:[&_.galaxy-node__visual]:ring-offset-4 focus-visible:[&_.galaxy-node__visual]:ring-offset-bg-base"
        aria-label={`${article.title} · ${formattedDate}`}
      >
        <span
          className="galaxy-node__visual relative flex aspect-square w-28 shrink-0 items-center justify-center rounded-full sm:w-36"
          aria-hidden="true"
        >
          <span className="galaxy-node__orbit galaxy-node__orbit--outer absolute inset-[7%] rounded-full border border-[color:var(--node-core)]/25 transition-transform duration-700 group-hover:rotate-12" />
          <span className="galaxy-node__orbit galaxy-node__orbit--inner absolute inset-[19%] -rotate-[24deg] rounded-full border border-[color:var(--node-secondary)]/35 transition-transform duration-700 group-hover:-rotate-45" />
          <span
            className="galaxy-node__arm absolute h-[36%] w-[83%] rotate-[18deg] rounded-[50%] border border-[color:var(--node-core)]/55 transition-transform duration-700 group-hover:rotate-[29deg] group-hover:scale-110"
            style={{ boxShadow: `0 0 18px ${palette.halo}` }}
          />
          <span
            className="galaxy-node__core relative block size-12 rounded-full border border-white/35 sm:size-14"
            style={{
              background: `radial-gradient(circle at 34% 30%, #fff 0 4%, ${palette.secondary} 10%, ${palette.core} 34%, transparent 72%)`,
              boxShadow: `0 0 16px ${palette.core}, 0 0 44px ${palette.halo}`,
            }}
          />
          <span
            className="galaxy-node__satellite absolute right-[5%] top-[22%] size-2 rounded-full"
            style={{ backgroundColor: palette.secondary, boxShadow: `0 0 10px ${palette.secondary}` }}
          />
          <span
            className="galaxy-node__satellite galaxy-node__satellite--small absolute bottom-[16%] left-[12%] size-1 rounded-full"
            style={{ backgroundColor: palette.core, boxShadow: `0 0 8px ${palette.core}` }}
          />
        </span>

        <span className="galaxy-node__content relative block min-w-0 border-l border-border/70 pl-5 sm:pl-7">
          <span
            className="galaxy-node__connector absolute top-1/2 right-full h-px w-5 bg-gradient-to-l from-border to-transparent sm:w-7"
            aria-hidden="true"
          />
          <span className="mb-3 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-text-muted">
            <span style={{ color: palette.core }}>{String(index + 1).padStart(2, "0")}</span>
            <time dateTime={article.createdAt}>{formattedDate}</time>
          </span>
          <h3 className="m-0 font-display text-xl font-bold leading-tight text-text-primary transition-colors duration-300 group-hover:text-accent sm:text-2xl">
            {article.title}
          </h3>
          {article.excerpt && (
            <span className="mt-3 line-clamp-2 font-body text-sm leading-relaxed text-text-secondary transition-colors duration-300 group-hover:text-text-primary sm:text-base">
              {article.excerpt}
            </span>
          )}
          {(article.tags ?? []).length > 0 && (
            <span className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-text-muted">
              {(article.tags ?? []).slice(0, 3).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </span>
          )}
        </span>
      </Link>
    </article>
  );
}
