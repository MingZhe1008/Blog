"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GalaxyNode } from "@/components/galaxy-node";
import type { Article } from "@/lib/data";

export function HomeView({ articles }: { articles: Article[] }) {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const locale = useLocale();

  const stagger = (i: number) => ({
    animationDelay: `${i * 150}ms`,
  });

  return (
    <main className="galaxy-home relative min-h-screen overflow-hidden">
      <section className="galaxy-hero relative mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] md:px-10 lg:px-14">
        <div className="relative z-10 max-w-2xl md:pb-16">
          <p
            className="animate-in mb-7 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.34em] text-text-muted"
            style={stagger(0)}
          >
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_#77e8d6]" aria-hidden="true" />
            {t("greeting")}
          </p>
          <h1
            className="animate-in m-0 font-display text-[clamp(4.2rem,12vw,9.5rem)] font-black leading-[0.72] tracking-[-0.075em] text-text-primary"
            style={stagger(1)}
          >
            Ming<span className="text-accent">Zhe</span>
          </h1>
          <p
            className="animate-in mt-9 max-w-lg border-l border-accent/40 pl-5 font-body text-lg leading-relaxed text-text-secondary sm:text-xl"
            style={stagger(2)}
          >
            {t("bio")}
          </p>
          <div className="animate-in mt-10 flex flex-wrap items-center gap-4" style={stagger(3)}>
            <Link
              href="#recent-orbits"
              className="group inline-flex items-center gap-3 border border-border bg-bg-surface/40 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-text-primary transition-colors hover:border-accent/70 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {t("articles")}
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">↘</span>
            </Link>
            <a
              href="https://github.com/MingZhe1008"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-3 font-mono text-xs uppercase tracking-[0.16em] text-text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              aria-label={t("github")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {t("github")}
            </a>
          </div>
        </div>

        <div className="hero-system animate-in relative mx-auto aspect-square w-full max-w-[34rem] md:translate-x-[7%]" style={stagger(2)} aria-hidden="true">
          <span className="hero-system__coordinates absolute top-[8%] right-[5%] font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.25em] text-text-muted/70">
            RA 18H 36M<br />DEC +38° 47′
          </span>
          <span className="hero-system__orbit hero-system__orbit--outer absolute inset-[4%] rounded-full border border-[#77e8d6]/15" />
          <span className="hero-system__orbit hero-system__orbit--middle absolute inset-[17%] rotate-[28deg] rounded-full border border-[#f4e9c9]/20" />
          <span className="hero-system__orbit hero-system__orbit--inner absolute inset-[30%] -rotate-[38deg] rounded-full border border-[#ffb45b]/25" />
          <span className="hero-system__primary absolute top-1/2 left-1/2 size-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-[radial-gradient(circle_at_32%_28%,#fff_0_3%,#f4e9c9_11%,#ffb45b_32%,#603b6f_60%,transparent_72%)] shadow-[0_0_35px_rgba(255,180,91,0.52),0_0_110px_rgba(167,139,250,0.25)]" />
          <span className="hero-system__ring absolute top-1/2 left-1/2 h-[15%] w-[51%] -translate-x-1/2 -translate-y-1/2 rotate-[-17deg] rounded-[50%] border border-[#f4e9c9]/60 shadow-[0_0_18px_rgba(244,233,201,0.12)]" />
          <span className="hero-system__satellite hero-system__satellite--one absolute top-[22%] left-[18%] size-3 rounded-full bg-[#77e8d6] shadow-[0_0_18px_#77e8d6]" />
          <span className="hero-system__satellite hero-system__satellite--two absolute right-[11%] bottom-[28%] size-2 rounded-full bg-[#f4e9c9] shadow-[0_0_14px_#f4e9c9]" />
          <span className="absolute bottom-[8%] left-[9%] h-px w-24 rotate-[-18deg] bg-gradient-to-r from-transparent via-[#a78bfa]/60 to-transparent" />
        </div>
      </section>

      <section id="recent-orbits" className="star-map relative mx-auto max-w-7xl scroll-mt-24 px-6 pb-28 pt-12 md:px-10 lg:px-14" aria-labelledby="recent-orbits-title">
        <div className="mb-12 flex items-end justify-between gap-6 border-b border-border/70 pb-5 md:mb-16">
          <div>
            <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-accent">{t("fieldLog")}</p>
            <h2 id="recent-orbits-title" className="m-0 font-display text-2xl font-bold text-text-primary sm:text-3xl">
            {t("recent")}
            </h2>
          </div>
          <Link
            href="/blog"
            className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {t("viewAll")}
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="empty-constellation flex min-h-80 flex-col items-center justify-center border-y border-border/50 py-16 text-center">
            <span className="relative mb-8 flex size-24 items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full border border-dashed border-text-muted/25" />
              <span className="size-3 rounded-full bg-text-muted/40 shadow-[0_0_22px_rgba(148,163,184,0.2)]" />
            </span>
            <p className="font-body text-base text-text-muted">{t("noArticles")}</p>
            <Link
              href="/blog"
              className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {t("viewAll")}
            </Link>
          </div>
        ) : (
          <div className="star-map__nodes relative grid grid-cols-1 gap-y-3 md:grid-cols-12 md:gap-x-5 md:gap-y-16">
            <span className="star-map__route pointer-events-none absolute top-0 bottom-0 left-14 hidden border-l border-dashed border-[#77e8d6]/15 md:left-1/2 md:block" aria-hidden="true" />
            {articles.slice(0, 5).map((article, index) => (
              <GalaxyNode key={article.id} article={article} index={index} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <footer className="relative border-t border-border/60 py-8 text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-text-muted">
          © {new Date().getFullYear()} · {common("poweredBy")}
        </p>
      </footer>
    </main>
  );
}
