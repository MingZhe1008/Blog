"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { NoteSummary } from "@/lib/notes";
export function AdminNotes({ notes }: { notes: NoteSummary[] }) {
  const t = useTranslations("notes");
  return <div className="note-admin"><div className="section-heading"><h1>{t("manage")}</h1><Link href="/admin/notes/new" className="primary-link">+ {t("new")}</Link></div>
    {notes.length ? <div className="notes-cards">{notes.map(note => <div className="journal-card note-card" key={note.id}><p className="note-path">{note.path.join(" → ")}</p><h2>{note.title}</h2><div className="note-tags"><span className="article-tag">{note.status === "published" ? t("published") : t("draftStatus")}</span>{note.tags.map(tag => <span className="article-tag" key={tag}>{tag}</span>)}</div><div className="hero-actions"><Link href={`/admin/notes/${note.id}`}>{t("edit")} ↗</Link>{note.status === "published" && <Link href={`/notes/${note.id}`}>{t("view")}</Link>}</div></div>)}</div> : <p className="empty-message">{t("empty")}</p>}
  </div>;
}
