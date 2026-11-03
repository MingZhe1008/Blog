"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, FileText, Folder, GripVertical } from "lucide-react";
import type { NoteSummary } from "@/lib/notes";
import { moveNote } from "@/server-actions/notes";
type Branch = { path: string[]; folders: Map<string, Branch>; notes: NoteSummary[]; count: number };
const key = (path: string[]) => JSON.stringify(path);
export function AdminNotes({ notes }: { notes: NoteSummary[] }) {
  const t = useTranslations("notes"), en = useLocale() === "en";
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<number | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [moving, setMoving] = useState<number | null>(null);
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const root: Branch = { path: [], folders: new Map(), notes: [], count: notes.length }, folders: Branch[] = [];
  for (const note of notes) {
    let branch = root;
    for (const name of note.path) {
      if (!branch.folders.has(name)) {
        const child: Branch = { path: [...branch.path, name], folders: new Map(), notes: [], count: 0 };
        branch.folders.set(name, child); folders.push(child);
      }
      branch = branch.folders.get(name)!; branch.count++;
    }
    branch.notes.push(note);
  }
  folders.sort((a,b) => a.path.join(" / ").localeCompare(b.path.join(" / "), "zh-CN"));
  function move(id: number, path: string[]) {
    const note = notes.find(n => n.id === id);
    if (!note || pending || key(note.path) === key(path)) return;
    setMessage(en ? "Moving…" : "正在移动…");
    startTransition(async () => {
      try {
        const result = await moveNote(id, path, note.path);
        if ("error" in result) { setMessage(en ? "Move failed. Refresh and try again." : "移动失败，请刷新页面后重试。"); return; }
        setMoving(null); setCollapsed(new Set());
        setMessage(en ? `Moved to ${path.join(" / ")}` : `已移动到 ${path.join(" / ")}`);
      } catch { setMessage(en ? "Move failed. Please retry." : "移动失败，请重试。"); }
    });
  }
  function render(branch: Branch): React.ReactNode {
    return <ul>{[...branch.folders.values()].sort((a,b) => a.path.at(-1)!.localeCompare(b.path.at(-1)!, "zh-CN")).map(folder => {
      const folderKey = key(folder.path), closed = collapsed.has(folderKey);
      return <li key={folderKey}><div className={`admin-note-folder ${over === folderKey ? "is-drop-target" : ""}`} data-folder={folderKey}
        onDragOver={e => { if (dragId !== null && !pending) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOver(folderKey); } }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null); }}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); setOver(null); const id = dragId; setDragId(null); if (id !== null) move(id, folder.path); }}>
        <button type="button" aria-expanded={!closed} onClick={() => setCollapsed(previous => { const next = new Set(previous); if (closed) next.delete(folderKey); else next.add(folderKey); return next; })}>
          {closed ? <ChevronRight size={15}/> : <ChevronDown size={15}/>}<Folder size={17}/><span>{folder.path.at(-1)}</span><small>{folder.count}</small>
        </button><span className="admin-note-drop-label">{en ? "Drop here" : "移到此目录"}</span>
      </div>{!closed && render(folder)}</li>;
    })}{branch.notes.map(note => <li key={note.id} className={`admin-note-row ${dragId === note.id ? "is-dragging" : ""}`} data-note-id={note.id}>
      <div className="admin-note-identity" draggable={!pending} onDragStart={e => { setDragId(note.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(note.id)); }} onDragEnd={() => { setDragId(null); setOver(null); }}>
        <GripVertical size={15} className="admin-note-grip" aria-hidden="true"/><FileText size={16} aria-hidden="true"/><Link draggable={false} href={`/admin/notes/${note.id}`}>{note.title}</Link>
      </div><span className="admin-note-status">{note.status === "published" ? t("published") : t("draftStatus")}</span>
      <button type="button" disabled={pending} onClick={() => { setMoving(note.id); setTarget(key(note.path)); }}>{en ? "Move to" : "移动到"}</button>
      <Link href={`/admin/notes/${note.id}`}>{t("edit")}</Link>
    </li>)}</ul>;
  }
  return <div className="note-admin"><div className="section-heading"><h1>{t("manage")}</h1><Link href="/admin/notes/new" className="primary-link">+ {t("new")}</Link></div>
    <div className="admin-note-toolbar"><p>{en ? `${notes.length} notes · Drag a note onto a folder to move it.` : `${notes.length} 篇笔记 · 拖动笔记到目录，即可调整归属。`}</p><div><button onClick={() => setCollapsed(new Set())}>{en ? "Expand all" : "全部展开"}</button><button onClick={() => setCollapsed(new Set(folders.map(f => key(f.path))))}>{en ? "Collapse all" : "全部收起"}</button></div></div>
    <p className="admin-note-feedback" role="status" aria-live="polite">{message}</p>
    {moving !== null && <form className="admin-note-move" onSubmit={e => { e.preventDefault(); if (target) move(moving, JSON.parse(target)); }}><label htmlFor="note-move-target">{en ? "Move note:" : "移动笔记："} {notes.find(n => n.id === moving)?.title}</label><select id="note-move-target" value={target} onChange={e => setTarget(e.target.value)} disabled={pending}>{folders.map(f => <option key={key(f.path)} value={key(f.path)}>{f.path.join(" / ")}</option>)}</select><button type="submit" disabled={pending || target === key(notes.find(n => n.id === moving)?.path ?? [])}>{en ? "Move" : "确认移动"}</button><button type="button" disabled={pending} onClick={() => setMoving(null)}>{en ? "Cancel" : "取消"}</button></form>}
    {notes.length ? <nav className="admin-notes-tree" aria-label={t("directory")} aria-busy={pending}>{render(root)}</nav> : <p className="empty-message">{t("empty")}</p>}
  </div>;
}
