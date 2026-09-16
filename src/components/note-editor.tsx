"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { saveNote } from "@/server-actions/notes";
import type { Note } from "@/lib/notes";

export function NoteEditor({ note, paths }: { note?: Note; paths: string[][] }) {
  const t = useTranslations("notes");
  const router = useRouter();
  const [title, setTitle] = useState(note?.title ?? "");
  const [levels, setLevels] = useState(note?.path.length ? note.path : [""]);
  const [tags, setTags] = useState(note?.tags.join(", ") ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(status: "draft" | "published") {
    if (busy) return;
    if (!title.trim() || !content.trim() || levels.some(l => !l.trim())) { setError(t("required")); return; }
    setBusy(true); setError("");
    try {
      const result = await saveNote({ id: note?.id, title, path: levels, tags: tags.split(/[,，]/).map(t => t.trim()).filter(Boolean), content, status });
      if (result.error) { setError(t(result.error)); return; }
      router.push("/admin/notes"); router.refresh();
    } catch { setError(t("saveFailed")); }
    finally { setBusy(false); }
  }
  return <div className="note-admin"><Link href="/admin/notes">{t("back")}</Link><h1>{note ? t("edit") : t("new")}</h1>
    <form className="note-editor" onSubmit={e => { e.preventDefault(); void submit("draft"); }}>
      <fieldset disabled={busy}>
        <label htmlFor="note-title">{t("name")}</label><input id="note-title" maxLength={200} value={title} onChange={e => setTitle(e.target.value)} required />
        <div className="note-level-heading"><label>{t("hierarchy")}</label><button type="button" disabled={levels.length >= 12} onClick={() => setLevels([...levels, ""])}>+ {t("addLevel")}</button></div>
        <p className="note-path">{t("hierarchyHelp")}</p>
        <div className="note-levels">{levels.map((level, index) => {
          const suggestions = [...new Set(paths.filter(p => levels.slice(0,index).every((v,i) => p[i] === v.trim())).map(p => p[index]).filter(Boolean))];
          return <div key={index}><label htmlFor={`level-${index}`}>{index + 1}</label><input id={`level-${index}`} list={`suggestions-${index}`} maxLength={100} value={level} required onChange={e => setLevels(levels.map((v,i) => i === index ? e.target.value : v))} /><datalist id={`suggestions-${index}`}>{suggestions.map(s => <option key={s} value={s} />)}</datalist>{levels.length > 1 && <button type="button" aria-label={t("removeLevel")} onClick={() => setLevels(levels.slice(0,index).concat(levels.slice(index+1)))}>×</button>}</div>;
        })}</div>
        <p className="note-breadcrumb">{[...levels.map(l => l || "…"), title || "…"].join(" → ")}</p>
        <label htmlFor="note-tags">{t("tags")}</label><input id="note-tags" value={tags} onChange={e => setTags(e.target.value)} placeholder={t("tagsHelp")} />
        <div className="note-tags">{tags.split(/[,，]/).map(t => t.trim()).filter(Boolean).map((tag,i) => <span className="article-tag" key={i}>{tag}</span>)}</div>
        <label htmlFor="note-content">{t("content")}</label><textarea id="note-content" rows={22} value={content} onChange={e => setContent(e.target.value)} required />
        {error && <p role="alert" className="note-error">{error}</p>}
        <div className="hero-actions"><button type="submit">{busy ? t("saving") : t("draft")}</button><button type="button" className="primary-link" onClick={() => void submit("published")}>{t("publish")}</button></div>
      </fieldset>
    </form></div>;
}
