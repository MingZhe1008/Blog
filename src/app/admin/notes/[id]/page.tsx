import { notFound } from "next/navigation";
import { getNote, getNotes } from "@/lib/notes";
import { NoteEditor } from "@/components/note-editor";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const note = await getNote(Number(id));
  if (!note) notFound();
  return <NoteEditor note={note} paths={(await getNotes(false)).map(n => n.path)} />;
}
