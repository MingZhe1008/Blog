"use client";

import Link from "next/link";
import type { Project } from "@/lib/projects";
import { useTranslations } from "next-intl";

export function ProjectsView({ projects }: { projects: Project[] }) {
  const t = useTranslations("projects");
  return (
    <main className="editorial-page projects-page">
      <header className="archive-heading">
        <h1>{t("title")}</h1>
        <p className="hero-intro">{t("intro")}</p>
      </header>
      <section className="projects-list" aria-label={t("title")}>
        {projects.map(project => <article className="project-entry" key={project.id}>
          <Link href={project.url || project.sourceUrl || "/projects"} className="project-cover" aria-label={t("visit")}>
            <div className="project-badges"><span>{project.status}</span><span>{t("type")}</span></div>
            {project.coverImage ? <img className="project-cover__image" src={project.coverImage} alt={project.title} loading="lazy" /> : <div className="project-preview" aria-hidden="true">
              <span className="project-preview__brand">MingZhe.</span>
              <span className="project-preview__title">{project.title}</span>
              <span className="project-preview__line" /><span className="project-preview__line" />
              <span className="project-preview__tags">Blog / Notes / Projects</span>
            </div>}
          </Link>
          <div className="project-entry__body">
          <h2>{project.title}</h2>
          <p className="project-description">{project.description}</p>
          <ul className="project-stack" aria-label="Tech stack">
            {project.tags.map(tech => <li key={tech}>{tech}</li>)}
          </ul>
          <div className="project-links">
            {project.sourceUrl && <a className="primary-link" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t("source")}</a>}
            {project.url && <Link className="primary-link" href={project.url}>{t("visit")}</Link>}
          </div>
          </div>
        </article>)}
        {projects.length === 0 && <p>{t("empty")}</p>}
      </section>
    </main>
  );
}
