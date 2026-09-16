import { getNotes } from "@/lib/notes";
import { NoteEditor } from "@/components/note-editor";
export const dynamic = "force-dynamic";
export default async function Page() { return <NoteEditor paths={(await getNotes(false)).map(n => n.path)} />; }
