"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { NoteSummary } from "@/lib/notes";

type Branch = { name: string; folders: Map<string, Branch>; notes: NoteSummary[] };
export function NotesTree({ notes }: { notes: NoteSummary[] }) {
  const pathname = usePathname();
  const t = useTranslations("notes");
  const root: Branch = { name: "", folders: new Map(), notes: [] };
  for (const note of notes) {
    let branch = root;
    for (const name of note.path) {
      if (!branch.folders.has(name)) branch.folders.set(name, { name, folders: new Map(), notes: [] });
      branch = branch.folders.get(name)!;
    }
    branch.notes.push(note);
  }
  function render(branch: Branch, prefix: string): React.ReactNode {
    return <ul>{[...branch.folders.values()].sort((a,b) => a.name.localeCompare(b.name)).map(folder =>
      <li key={JSON.stringify([prefix, folder.name])}><details open><summary>{folder.name}</summary>{render(folder, prefix + "/" + folder.name)}</details></li>
    )}{branch.notes.map(note => <li key={note.id}><Link href={`/notes/${note.id}`} aria-current={pathname === `/notes/${note.id}` ? "page" : undefined}>{note.title}</Link></li>)}</ul>;
  }
  return <nav aria-label={t("directory")} className="notes-tree"><Link className="notes-tree-home" href="/notes">{t("title")}</Link>{notes.length ? render(root, "") : <p>{t("empty")}</p>}</nav>;
}
