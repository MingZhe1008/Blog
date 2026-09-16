import { getNotes } from "@/lib/notes";
import { AdminNotes } from "@/components/admin-notes";
export const dynamic = "force-dynamic";
export default async function Page() { return <AdminNotes notes={await getNotes(false)} />; }
