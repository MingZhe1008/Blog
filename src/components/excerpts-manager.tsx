"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { saveReadingExcerpt } from "@/server-actions/reading-excerpts";
import type { ReadingExcerpt } from "@/lib/reading-excerpts";

export function ExcerptsManager({ excerpts }: { excerpts: ReadingExcerpt[] }) {
  const t = useTranslations("excerpts");
  const errors = useTranslations("notes");
  const router = useRouter();
  const [editing, setEditing] = useState<number | undefined>();
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function reset() { setEditing(undefined); setText(""); setSource(""); setEnabled(true); }
  return <div className="note-admin excerpts-admin">
    <h1>{t("title")}</h1><p className="note-path">{t("help")}</p>
    <form className="note-editor" onSubmit={async e => {
      e.preventDefault(); if (busy) return;
      setBusy(true); setError(""); setMessage("");
      try {
        const result = await saveReadingExcerpt({ id: editing, text, source, enabled });
        if (result.error) { setError(errors(result.error)); return; }
        reset(); setMessage(t("saved")); router.refresh();
      } catch { setError(errors("saveFailed")); }
      finally { setBusy(false); }
    }}>
      <fieldset disabled={busy}>
        <h2 className="excerpt-form-title">{editing ? t("edit") : t("new")}</h2>
        <label htmlFor="excerpt-text">{t("text")}</label>
        <textarea id="excerpt-text" rows={4} maxLength={2000} required value={text} onChange={e => setText(e.target.value)} />
        <label htmlFor="excerpt-source">{t("source")}</label>
        <input id="excerpt-source" maxLength={200} required value={source} onChange={e => setSource(e.target.value)} />
        <label className="excerpt-enabled"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />{t("enabled")}</label>
        <div className="hero-actions"><button className="primary-link" type="submit">{busy ? t("saving") : t("save")}</button>{editing && <button type="button" onClick={reset}>{t("cancel")}</button>}</div>
      </fieldset>
      {error && <p className="note-error" role="alert">{error}</p>}
      <p role="status">{message}</p>
    </form>
    <div className="notes-cards excerpt-list">
      {!excerpts.length && <p className="note-path">{t("empty")}</p>}
      {excerpts.map(excerpt => <article className="journal-card note-card" key={excerpt.id}>
        <p className="excerpt-body">{excerpt.text}</p><p className="note-path">— {excerpt.source}</p>
        <div className="section-heading"><span className="article-tag">{excerpt.enabled ? t("active") : t("inactive")}</span>
          <button type="button" className="excerpt-edit" disabled={busy} onClick={() => {
            setEditing(excerpt.id); setText(excerpt.text); setSource(excerpt.source); setEnabled(excerpt.enabled); setError(""); setMessage("");
            document.getElementById("excerpt-text")?.focus();
          }}>{t("edit")}</button>
        </div>
      </article>)}
    </div>
  </div>;
}
