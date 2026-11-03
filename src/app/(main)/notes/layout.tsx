import { getNotes } from "@/lib/notes";
import { NotesTree } from "@/components/notes-tree";
import { NotesWorkspace } from "@/components/notes-workspace";
export const dynamic = "force-dynamic";
export default async function NotesLayout({ children }: { children: React.ReactNode }) {
  const notes = await getNotes();
  return <NotesWorkspace sidebar={<NotesTree notes={notes} />}>{children}</NotesWorkspace>;
}
