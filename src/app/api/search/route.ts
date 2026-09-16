import { NextRequest, NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/data";
import { getNotes } from "@/lib/notes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (!query) return NextResponse.json({ results: [] });
  const normalized = query.toLocaleLowerCase();
  const [{ articles }, notes] = await Promise.all([
    getPublishedArticles({ query, limit: 6 }),
    getNotes(),
  ]);
  const articleResults = articles.map(article => ({
    type: "article" as const,
    title: article.title,
    description: article.excerpt || (article.tags ?? []).join(" · "),
    href: `/blog/${article.slug}`,
  }));
  const noteResults = notes.filter(note =>
    [note.title, ...note.path, ...note.tags].join(" ").toLocaleLowerCase().includes(normalized)
  ).slice(0, 6).map(note => ({
    type: "note" as const,
    title: note.title,
    description: [...note.path, ...note.tags].join(" · "),
    href: `/notes/${note.id}`,
  }));
  return NextResponse.json({ results: [...articleResults, ...noteResults].slice(0, 10) });
}
