"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, FileText, Folder, GripVertical } from "lucide-react";
import type { NoteSummary, NoteTreeChange } from "@/lib/notes";
import { moveNote, moveFolder, manageNoteTree } from "@/server-actions/notes";
type Branch = { path: string[]; folders: Map<string, Branch>; notes: NoteSummary[]; count: number };
const key = (path: string[]) => JSON.stringify(path);
export function AdminNotes({ notes }: { notes: NoteSummary[] }) {
  const t = useTranslations("notes"), en = useLocale() === "en";
  const router = useRouter();
  const [menu, setMenu] = useState<{x:number;y:number;target:NoteTreeChange | null} | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const close = (event: Event) => { if (!menuRef.current?.contains(event.target as Node)) setMenu(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") {setMenu(null);menuTrigger.current?.focus();} };
    window.addEventListener("pointerdown",close);window.addEventListener("keydown",escape);window.addEventListener("resize",close);window.addEventListener("scroll",close,true);
    return () => {window.removeEventListener("pointerdown",close);window.removeEventListener("keydown",escape);window.removeEventListener("resize",close);window.removeEventListener("scroll",close,true);};
  },[menu]);
  function openMenu(event: React.MouseEvent<HTMLElement>, target: NoteTreeChange | null) {
    event.preventDefault();event.stopPropagation();if(pending)return;
    menuTrigger.current = event.currentTarget;
    setMenu({x:Math.max(8,Math.min(event.clientX,window.innerWidth-232)),y:Math.max(8,Math.min(event.clientY,window.innerHeight-290)),target});
  }
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
  function contextAction(operation: "new" | "edit" | "rename" | "delete" | "move") {
    if (!menu || pending) return;
    const selected = menu.target;
    setMenu(null);
    const note = selected?.kind === "note" ? notes.find(n => n.id === selected.id) : undefined;
    const path = selected?.kind === "folder" ? selected.path : note?.path ?? [];
    if (operation === "new") { router.push(`/admin/notes/new${path.length ? `?path=${encodeURIComponent(key(path))}` : ""}`);return; }
    if (!selected) return;
    if (operation === "edit" && note) {router.push(`/admin/notes/${note.id}`);return;}
    if (operation === "move") { if (note) {setMoving(note.id);setTarget(key(note.path));} else {setFolderMoving(path);setTarget(key(path.slice(0,-1)));} return; }
    const affected = selected.kind === "note" ? notes.filter(n => n.id===selected.id) : notes.filter(n => starts(n.path,path));
    const label = note?.title ?? path.at(-1) ?? "";
    let name = "";
    if (operation === "rename") {
      const answer = window.prompt(en ? "Enter a new name" : "请输入新名称",label);
      if (answer === null || !answer.trim() || answer.trim()===label) return;
      name=answer.trim();
    } else if (operation === "delete") {
      const descendants = folders.filter(f => f.path.length>path.length && starts(f.path,path)).length;
      const warning = selected.kind === "folder"
        ? (en ? `Delete folder “${label}”, ${descendants} subfolders and ${affected.length} notes? This cannot be undone.` : `确认删除文件夹“${label}”？将同时删除 ${descendants} 个子目录和 ${affected.length} 篇笔记，此操作不可撤销。`)
        : (en ? `Delete note “${label}”? This cannot be undone.` : `确认删除笔记“${label}”？此操作不可撤销。`);
      if (!window.confirm(warning)) return;
    } else return;
    setMessage(en ? "Processing…" : "正在处理…");
    startTransition(async () => {
      try {
        const result=await manageNoteTree(selected,operation,name,affected);
        setMessage("error" in result ? (en ? "Operation failed. Refresh and check for name conflicts." : "操作失败，请刷新页面并检查名称是否重复。") : (en ? "Done." : "操作已完成。"));
      } catch {setMessage(en ? "Operation failed. Please retry." : "操作失败，请重试。");}
    });
  }
  function render(branch: Branch): React.ReactNode {
    return <ul>{[...branch.folders.values()].sort((a,b) => a.path.at(-1)!.localeCompare(b.path.at(-1)!, "zh-CN")).map(folder => {
      const folderKey = key(folder.path), closed = collapsed.has(folderKey);
      return <li key={folderKey}><div className={`admin-note-folder ${over === folderKey ? "is-drop-target" : ""}`} data-folder={folderKey} tabIndex={0} onContextMenu={e => openMenu(e,{kind:"folder",path:folder.path})} onKeyDown={e => {if(e.key==="ContextMenu" || (e.shiftKey&&e.key==="F10")){e.preventDefault();const box=e.currentTarget.getBoundingClientRect();menuTrigger.current=e.currentTarget;setMenu({x:Math.max(8,Math.min(box.left,window.innerWidth-232)),y:Math.max(8,Math.min(box.top,window.innerHeight-290)),target:{kind:"folder",path:folder.path}});}}}
        onDragOver={e => { if (validTarget(folder.path) && !pending) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOver(folderKey); } }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null); }}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); if (validTarget(folder.path) && !pending) drop(folder.path); }}>
        <span className="admin-folder-grip" draggable={!pending} title={en ? "Drag folder" : "拖动文件夹"} onDragStart={e => { setDragId(null); setDragFolder(folder.path); e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain",folderKey); }} onDragEnd={() => {setDragFolder(null);setOver(null);}}><GripVertical size={15}/></span>
        <button type="button" aria-expanded={!closed} onClick={() => setCollapsed(previous => { const next = new Set(previous); if (closed) next.delete(folderKey); else next.add(folderKey); return next; })}>
          {closed ? <ChevronRight size={15}/> : <ChevronDown size={15}/>}<Folder size={17}/><span>{folder.path.at(-1)}</span><small>{folder.count}</small>
        </button><span className="admin-note-drop-label">{en ? "Drop here" : "移到此目录"}</span>
      </div>{!closed && render(folder)}</li>;
    })}{branch.notes.map(note => <li key={note.id} className={`admin-note-row ${dragId === note.id ? "is-dragging" : ""}`} data-note-id={note.id} onContextMenu={e => openMenu(e,{kind:"note",id:note.id})}>
      <div className="admin-note-identity" draggable={!pending} onDragStart={e => { setDragFolder(null); setDragId(note.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(note.id)); }} onDragEnd={() => { setDragId(null); setOver(null); }}>
        <GripVertical size={15} className="admin-note-grip" aria-hidden="true"/><FileText size={16} aria-hidden="true"/><Link draggable={false} href={`/admin/notes/${note.id}`}>{note.title}</Link>
      </div><span className={`admin-note-status ${note.status === "published" ? "is-published" : ""}`}>{note.status === "published" ? t("published") : t("draftStatus")}</span>
      <div className="admin-note-tags">{note.tags.slice(0,3).map(tag => <span key={tag}>{tag}</span>)}</div>
      <time className="admin-note-updated" dateTime={new Date(note.updatedAt).toISOString()}>{new Date(note.updatedAt).toLocaleDateString("zh-CN")}</time>
    </li>)}</ul>;
  }
  return <div className="note-admin" onContextMenu={e => openMenu(e,null)}><div className="section-heading"><h1>{t("manage")}</h1><Link href="/admin/notes/new" className="primary-link">+ {t("new")}</Link></div>
    <div className="admin-note-toolbar"><p>{en ? `${notes.length} notes · Drag notes or folders onto a destination folder.` : `${notes.length} 篇笔记 · 拖动笔记或文件夹到目标目录，即可调整归属。`}</p><div><button onClick={() => setCollapsed(new Set())}>{en ? "Expand all" : "全部展开"}</button><button onClick={() => setCollapsed(new Set(folders.map(f => key(f.path))))}>{en ? "Collapse all" : "全部收起"}</button></div></div>
    {menu && <div ref={menuRef} className="admin-tree-context" role="menu" aria-label={en ? "Quick actions" : "快捷操作"} style={{left:menu.x,top:menu.y}} onContextMenu={e => e.preventDefault()} onKeyDown={e => {
      const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (["ArrowDown","ArrowUp","Home","End"].includes(e.key)){e.preventDefault();buttons[e.key==="Home"?0:e.key==="End"?buttons.length-1:(index+(e.key==="ArrowDown"?1:-1)+buttons.length)%buttons.length]?.focus();}
      if(e.key==="Tab")setMenu(null);
    }}><span>{menu.target?.kind==="folder" ? menu.target.path.at(-1) : menu.target?.kind==="note" ? notes.find(n=>menu.target?.kind==="note" && n.id===menu.target.id)?.title : (en ? "Notes" : "笔记管理")}</span>
      <button role="menuitem" onClick={() => contextAction("new")}>{en ? "New note here" : "在此新增笔记"}</button>
      {menu.target && <><button role="menuitem" onClick={() => contextAction(menu.target?.kind==="note"?"edit":"rename")}>{menu.target.kind==="note" ? (en?"Edit note":"编辑笔记") : (en?"Rename folder":"重命名文件夹")}</button>
      {menu.target.kind==="note" && <button role="menuitem" onClick={() => contextAction("rename")}>{en?"Rename":"重命名"}</button>}
      <button role="menuitem" onClick={() => contextAction("move")}>{en?"Move to…":"移动到…"}</button><button role="menuitem" className="admin-context-delete" onClick={() => contextAction("delete")}>{en?"Delete…":"删除…"}</button></>}
    </div>}
    <p className="admin-note-feedback" role="status" aria-live="polite">{message}</p>
    {folderMoving && <form className="admin-note-move" onSubmit={e => {e.preventDefault();moveBranch(folderMoving,JSON.parse(target));}}><label htmlFor="folder-move-target">{en ? "Move folder:" : "移动文件夹："} {folderMoving.join(" / ")}</label><select id="folder-move-target" value={target} onChange={e => setTarget(e.target.value)} disabled={pending}><option value="[]">{en ? "Top level" : "顶层目录"}</option>{folders.filter(f => !starts(f.path,folderMoving)).map(f => <option key={key(f.path)} value={key(f.path)}>{f.path.join(" / ")}</option>)}</select><button type="submit" disabled={pending || target===key(folderMoving.slice(0,-1))}>{en ? "Move" : "确认移动"}</button><button type="button" disabled={pending} onClick={() => setFolderMoving(null)}>{en ? "Cancel" : "取消"}</button></form>}
    {notes.length > 0 && <div className={`admin-folder-root ${over==="root" ? "is-drop-target" : ""}`} onDragOver={e => {if(validTarget([])&&!pending){e.preventDefault();setOver("root");}}} onDragLeave={() => setOver(null)} onDrop={e => {e.preventDefault();if(validTarget([])&&!pending)drop([]);}}>{en ? "Drop here to move to top level" : "拖到这里，移至顶层目录"}</div>}
    {moving !== null && <form className="admin-note-move" onSubmit={e => { e.preventDefault(); if (target) move(moving, JSON.parse(target)); }}><label htmlFor="note-move-target">{en ? "Move note:" : "移动笔记："} {notes.find(n => n.id === moving)?.title}</label><select id="note-move-target" value={target} onChange={e => setTarget(e.target.value)} disabled={pending}>{folders.map(f => <option key={key(f.path)} value={key(f.path)}>{f.path.join(" / ")}</option>)}</select><button type="submit" disabled={pending || target === key(notes.find(n => n.id === moving)?.path ?? [])}>{en ? "Move" : "确认移动"}</button><button type="button" disabled={pending} onClick={() => setMoving(null)}>{en ? "Cancel" : "取消"}</button></form>}
    {notes.length ? <nav className="admin-notes-tree" aria-label={t("directory")} aria-busy={pending}><div className="admin-notes-columns" aria-hidden="true"><span>{en ? "Title / Directory" : "标题 / 目录"}</span><span>{en ? "Status" : "状态"}</span><span>{en ? "Tags" : "标签"}</span><span>{en ? "Updated" : "更新时间"}</span></div>{render(root)}</nav> : <p className="empty-message">{t("empty")}</p>}
  </div>;
}
