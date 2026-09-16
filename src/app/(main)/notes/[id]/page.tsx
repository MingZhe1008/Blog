import { notFound } from "next/navigation";
import { getNote } from "@/lib/notes";
import { MDXContent } from "@/components/mdx-renderer";
export const dynamic = "force-dynamic";
export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const note = await getNote(Number(id));
  if (!note || note.status !== "published") notFound();
  return <article className="reading-panel note-reading"><header><p className="note-path">{note.path.join(" / ")}</p><h1>{note.title}</h1><div className="note-tags">{note.tags.map(tag => <span className="article-tag" key={tag}>{tag}</span>)}</div></header><MDXContent source={note.content} /></article>;
}
