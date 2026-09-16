"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { NoteSummary } from "@/lib/notes";
export function NotesOverview({ notes }: { notes: NoteSummary[] }) {
  const t = useTranslations("notes");
  return <><p className="eyebrow">KNOWLEDGE / NOTEBOOK</p><h1>{t("title")}</h1><p className="hero-intro">{t("intro")}</p>
    {notes.length ? <div className="notes-cards">{notes.map(note => <Link className="journal-card note-card" href={`/notes/${note.id}`} key={note.id}><p className="note-path">{note.path.join(" / ")}</p><h2>{note.title}</h2><div className="note-tags">{note.tags.map(tag => <span key={tag} className="article-tag">{tag}</span>)}</div></Link>)}</div> : <div className="reading-panel"><p>{t("empty")}</p><p className="note-path">{t("example")}</p></div>}
  </>;
}
