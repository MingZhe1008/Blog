"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, FileText, Folder, GripVertical } from "lucide-react";
import type { NoteSummary } from "@/lib/notes";
import { moveNote, moveFolder } from "@/server-actions/notes";
type Branch = { path: string[]; folders: Map<string, Branch>; notes: NoteSummary[]; count: number };
const key = (path: string[]) => JSON.stringify(path);
export function AdminNotes({ notes }: { notes: NoteSummary[] }) {
  const t = useTranslations("notes"), en = useLocale() === "en";
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragFolder, setDragFolder] = useState<string[] | null>(null);
  const [folderMoving, setFolderMoving] = useState<string[] | null>(null);
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
  const starts = (path: string[], prefix: string[]) => prefix.every((p,i) => path[i] === p);
  function validTarget(parent: string[]) {
    if (!dragFolder) return dragId !== null && parent.length > 0;
    const destination = [...parent, dragFolder[dragFolder.length-1]];
    return !starts(parent,dragFolder) && !folders.some(f => key(f.path) === key(destination)) &&
      !notes.some(n => starts(n.path,dragFolder) && parent.length+1+n.path.length-dragFolder.length > 12);
  }
  function moveBranch(source: string[], parent: string[]) {
    if (pending) return;
    setMessage(en ? "Moving folder…" : "正在移动文件夹…");
    const expected = notes.filter(n => starts(n.path,source)).map(n => ({id:n.id,path:n.path}));
    startTransition(async () => {
      try {
        const result = await moveFolder(source,parent,expected);
        if ("error" in result) { setMessage(en ? "Move failed. Check for conflicts and refresh." : "移动失败，请检查同名目录、层级或刷新后重试。"); return; }
        setFolderMoving(null); setCollapsed(new Set());
        setMessage(en ? "Folder and all notes moved." : "文件夹及全部子目录、笔记已移动。");
      } catch { setMessage(en ? "Move failed. Please retry." : "移动失败，请重试。"); }
    });
  }
  function drop(parent: string[]) {
    if (dragFolder) moveBranch(dragFolder,parent); else if (dragId !== null) move(dragId,parent);
    setDragFolder(null); setDragId(null); setOver(null);
  }
  function render(branch: Branch): React.ReactNode {
    return <ul>{[...branch.folders.values()].sort((a,b) => a.path.at(-1)!.localeCompare(b.path.at(-1)!, "zh-CN")).map(folder => {
      const folderKey = key(folder.path), closed = collapsed.has(folderKey);
      return <li key={folderKey}><div className={`admin-note-folder ${over === folderKey ? "is-drop-target" : ""}`} data-folder={folderKey}
        onDragOver={e => { if (validTarget(folder.path) && !pending) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOver(folderKey); } }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null); }}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); if (validTarget(folder.path) && !pending) drop(folder.path); }}>
        <span className="admin-folder-grip" draggable={!pending} title={en ? "Drag folder" : "拖动文件夹"} onDragStart={e => { setDragId(null); setDragFolder(folder.path); e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain",folderKey); }} onDragEnd={() => {setDragFolder(null);setOver(null);}}><GripVertical size={15}/></span>
        <button type="button" aria-expanded={!closed} onClick={() => setCollapsed(previous => { const next = new Set(previous); if (closed) next.delete(folderKey); else next.add(folderKey); return next; })}>
          {closed ? <ChevronRight size={15}/> : <ChevronDown size={15}/>}<Folder size={17}/><span>{folder.path.at(-1)}</span><small>{folder.count}</small>
        </button><button type="button" className="admin-folder-move-button" disabled={pending} onClick={() => {setFolderMoving(folder.path);setTarget(key(folder.path.slice(0,-1)));}}>{en ? "Move to" : "移动到"}</button><span className="admin-note-drop-label">{en ? "Drop here" : "移到此目录"}</span>
      </div>{!closed && render(folder)}</li>;
    })}{branch.notes.map(note => <li key={note.id} className={`admin-note-row ${dragId === note.id ? "is-dragging" : ""}`} data-note-id={note.id}>
      <div className="admin-note-identity" draggable={!pending} onDragStart={e => { setDragFolder(null); setDragId(note.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(note.id)); }} onDragEnd={() => { setDragId(null); setOver(null); }}>
        <GripVertical size={15} className="admin-note-grip" aria-hidden="true"/><FileText size={16} aria-hidden="true"/><Link draggable={false} href={`/admin/notes/${note.id}`}>{note.title}</Link>
      </div><span className="admin-note-status">{note.status === "published" ? t("published") : t("draftStatus")}</span>
      <button type="button" disabled={pending} onClick={() => { setMoving(note.id); setTarget(key(note.path)); }}>{en ? "Move to" : "移动到"}</button>
      <Link href={`/admin/notes/${note.id}`}>{t("edit")}</Link>
    </li>)}</ul>;
  }
  return <div className="note-admin"><div className="section-heading"><h1>{t("manage")}</h1><Link href="/admin/notes/new" className="primary-link">+ {t("new")}</Link></div>
    <div className="admin-note-toolbar"><p>{en ? `${notes.length} notes · Drag notes or folders onto a destination folder.` : `${notes.length} 篇笔记 · 拖动笔记或文件夹到目标目录，即可调整归属。`}</p><div><button onClick={() => setCollapsed(new Set())}>{en ? "Expand all" : "全部展开"}</button><button onClick={() => setCollapsed(new Set(folders.map(f => key(f.path))))}>{en ? "Collapse all" : "全部收起"}</button></div></div>
    <p className="admin-note-feedback" role="status" aria-live="polite">{message}</p>
    {folderMoving && <form className="admin-note-move" onSubmit={e => {e.preventDefault();moveBranch(folderMoving,JSON.parse(target));}}><label htmlFor="folder-move-target">{en ? "Move folder:" : "移动文件夹："} {folderMoving.join(" / ")}</label><select id="folder-move-target" value={target} onChange={e => setTarget(e.target.value)} disabled={pending}><option value="[]">{en ? "Top level" : "顶层目录"}</option>{folders.filter(f => !starts(f.path,folderMoving)).map(f => <option key={key(f.path)} value={key(f.path)}>{f.path.join(" / ")}</option>)}</select><button type="submit" disabled={pending || target===key(folderMoving.slice(0,-1))}>{en ? "Move" : "确认移动"}</button><button type="button" disabled={pending} onClick={() => setFolderMoving(null)}>{en ? "Cancel" : "取消"}</button></form>}
    {notes.length > 0 && <div className={`admin-folder-root ${over==="root" ? "is-drop-target" : ""}`} onDragOver={e => {if(validTarget([])&&!pending){e.preventDefault();setOver("root");}}} onDragLeave={() => setOver(null)} onDrop={e => {e.preventDefault();if(validTarget([])&&!pending)drop([]);}}>{en ? "Drop here to move to top level" : "拖到这里，移至顶层目录"}</div>}
    {moving !== null && <form className="admin-note-move" onSubmit={e => { e.preventDefault(); if (target) move(moving, JSON.parse(target)); }}><label htmlFor="note-move-target">{en ? "Move note:" : "移动笔记："} {notes.find(n => n.id === moving)?.title}</label><select id="note-move-target" value={target} onChange={e => setTarget(e.target.value)} disabled={pending}>{folders.map(f => <option key={key(f.path)} value={key(f.path)}>{f.path.join(" / ")}</option>)}</select><button type="submit" disabled={pending || target === key(notes.find(n => n.id === moving)?.path ?? [])}>{en ? "Move" : "确认移动"}</button><button type="button" disabled={pending} onClick={() => setMoving(null)}>{en ? "Cancel" : "取消"}</button></form>}
    {notes.length ? <nav className="admin-notes-tree" aria-label={t("directory")} aria-busy={pending}>{render(root)}</nav> : <p className="empty-message">{t("empty")}</p>}
  </div>;
}
