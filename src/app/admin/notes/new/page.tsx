import { getNotes } from "@/lib/notes";
import { NoteEditor } from "@/components/note-editor";
export const dynamic = "force-dynamic";
export default async function Page({searchParams}: {searchParams: Promise<{path?: string}>}) {
  const query = await searchParams;
  let initialPath: string[] | undefined;
  try { const value: unknown = JSON.parse(query.path ?? "null"); if (Array.isArray(value) && value.length > 0 && value.length <= 12 && value.every(p => typeof p === "string" && p.trim() && p.length <= 100)) initialPath = value; } catch {}
  return <NoteEditor initialPath={initialPath} paths={(await getNotes(false)).map(n => n.path)} />;
}
