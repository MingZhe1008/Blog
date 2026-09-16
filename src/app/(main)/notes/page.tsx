import { getNotes } from "@/lib/notes";
import { NotesOverview } from "@/components/notes-overview";
export const dynamic = "force-dynamic";
export default async function NotesPage() { return <NotesOverview notes={await getNotes()} />; }
