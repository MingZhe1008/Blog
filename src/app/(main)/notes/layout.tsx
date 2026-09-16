import { getNotes } from "@/lib/notes";
import { NotesTree } from "@/components/notes-tree";
export const dynamic = "force-dynamic";
export default async function NotesLayout({ children }: { children: React.ReactNode }) {
  const notes = await getNotes();
  return <main className="notes-workspace"><aside className="notes-sidebar"><NotesTree notes={notes} /></aside><div className="notes-main">{children}</div></main>;
}
