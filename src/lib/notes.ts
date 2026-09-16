import { eq, desc } from "drizzle-orm";
import { getDb, saveDb, schema } from "./db";

export type Note = typeof schema.notes.$inferSelect;
export type NoteSummary = Omit<Note, "content">;
export async function getNotes(publishedOnly = true): Promise<NoteSummary[]> {
  const db = await getDb();
  return db.select({
    id: schema.notes.id, title: schema.notes.title, path: schema.notes.path,
    tags: schema.notes.tags, status: schema.notes.status,
    createdAt: schema.notes.createdAt, updatedAt: schema.notes.updatedAt,
  }).from(schema.notes).where(publishedOnly ? eq(schema.notes.status, "published") : undefined)
    .orderBy(desc(schema.notes.updatedAt), desc(schema.notes.id)).all();
}
export async function getNote(id: number) {
  return (await getDb()).select().from(schema.notes).where(eq(schema.notes.id, id)).get();
}
export async function persistNote(input: {
  id?: number; title: string; path: string[]; tags: string[]; content: string; status: "draft" | "published";
}) {
  if (!input || typeof input.title !== "string" || !input.title.trim() ||
      typeof input.content !== "string" || !input.content.trim() ||
      !Array.isArray(input.path) || !input.path.length || input.path.length > 12 ||
      input.path.some(p => typeof p !== "string" || !p.trim() || p.length > 100) ||
      !Array.isArray(input.tags) || input.tags.some(t => typeof t !== "string" || t.length > 100) ||
      !["draft", "published"].includes(input.status) || input.title.length > 200 ||
      (input.id !== undefined && (!Number.isSafeInteger(input.id) || input.id < 1))) {
    throw new Error("Invalid note");
  }
  const db = await getDb();
  const values = { title: input.title.trim(), content: input.content, path: input.path.map(p => p.trim()),
    tags: [...new Set(input.tags.map(t => t.trim()).filter(Boolean))],
    status: input.status, updatedAt: new Date().toISOString() };
  if (input.id !== undefined) {
    if (!await getNote(input.id)) throw new Error("Note not found");
    db.update(schema.notes).set(values).where(eq(schema.notes.id, input.id)).run();
    saveDb();
    return input.id;
  }
  const result = db.insert(schema.notes).values({ ...values, createdAt: values.updatedAt }).returning({ id: schema.notes.id }).get();
  saveDb();
  return result.id;
}
