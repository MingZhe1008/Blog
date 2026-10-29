"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function ProjectsView() {
  const t = useTranslations("projects");
  return (
    <main className="editorial-page projects-page">
      <header className="archive-heading">
        <h1>{t("title")}</h1>
        <p className="hero-intro">{t("intro")}</p>
      </header>
      <section className="projects-list" aria-label={t("title")}>
        <article className="project-entry">
          <Link href="/blog" className="project-cover" aria-label={t("visit")}>
            <div className="project-badges"><span>{t("status")}</span><span>{t("type")}</span></div>
            <div className="project-preview" aria-hidden="true">
              <span className="project-preview__brand">MingZhe.</span>
              <span className="project-preview__title">{t("blogTitle")}</span>
              <span className="project-preview__line" /><span className="project-preview__line" />
              <span className="project-preview__tags">Blog / Notes / Projects</span>
            </div>
          </Link>
          <div className="project-entry__body">
          <h2>{t("blogTitle")}</h2>
          <p className="project-description">{t("blogDescription")}</p>
          <ul className="project-stack" aria-label="Tech stack">
            {["Next.js", "TypeScript", "SQLite", "Tailwind CSS"].map(tech => <li key={tech}>{tech}</li>)}
          </ul>
          <div className="project-links">
            <a className="primary-link" href="https://github.com/MingZhe1008/Blog" target="_blank" rel="noopener noreferrer">{t("source")}</a>
            <Link className="primary-link" href="/blog">{t("visit")}</Link>
          </div>
          </div>
        </article>
      </section>
    </main>
  );
}
