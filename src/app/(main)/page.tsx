import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPublishedArticles } from "@/lib/data";
import { ArticleCard } from "@/components/article-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations("home");
  const { articles } = await getPublishedArticles({ limit: 5 });

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-32 pb-16 text-center">
        <p className="font-ui text-text-muted text-sm mb-6 tracking-widest uppercase">
          {t("greeting")}
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-black text-accent mb-5">
          MingZhe
        </h1>
        <p className="font-body text-text-secondary text-lg max-w-md mx-auto leading-relaxed">
          {t("bio")}
        </p>
        <div className="flex justify-center gap-4 mt-8">
          {[
            { label: t("github"), href: "https://github.com/MingZhe1008" },
            { label: t("articles"), href: "/blog" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-ui text-sm text-text-secondary hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent articles */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-lg font-bold text-text-muted">
            {t("recent")}
          </h2>
          <Link
            href="/blog"
            className="font-ui text-xs text-text-muted hover:text-accent transition-colors"
          >
            {t("viewAll", { defaultValue: "View all →" })}
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="font-ui text-text-muted text-sm text-center py-12">
            {t("noArticles")}
          </p>
        ) : (
          articles.map((a) => <ArticleCard key={a.id} article={a} />)
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="font-ui text-xs text-text-muted">
          © {new Date().getFullYear()} · Built with curiosity
        </p>
      </footer>
    </main>
  );
}
