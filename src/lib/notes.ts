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
export async function moveNotePath(id: number, path: string[], expectedPath: string[]) {
  if (!Number.isSafeInteger(id) || id < 1 || !Array.isArray(path) || !path.length || path.length > 12 ||
      path.some(p => typeof p !== "string" || !p.trim() || p.length > 100) || !Array.isArray(expectedPath)) throw new Error("Invalid move");
  const db = await getDb();
  const note = await getNote(id);
  if (!note || JSON.stringify(note.path) !== JSON.stringify(expectedPath)) throw new Error("Stale note");
  const target = path.map(p => p.trim());
  if (!(await getNotes(false)).some(n => target.every((p, i) => n.path[i] === p))) throw new Error("Folder not found");
  // Update only location; preserve the latest content, tags and publication state.
  db.update(schema.notes).set({ path: target, updatedAt: new Date().toISOString() }).where(eq(schema.notes.id, id)).run();
  saveDb();
}
export async function moveNoteFolder(source: string[], parent: string[], expected: {id: number; path: string[]}[]) {
  const valid = (path: string[]) => Array.isArray(path) && path.length <= 12 && path.every(p => typeof p === "string" && !!p.trim() && p.length <= 100 && p === p.trim());
  const starts = (path: string[], prefix: string[]) => prefix.every((p,i) => path[i] === p);
  if (!valid(source) || !source.length || !valid(parent) || starts(parent, source) || !Array.isArray(expected)) throw new Error("Invalid folder move");
  const notes = await getNotes(false), destination = [...parent, source[source.length - 1]];
  if (parent.length && !notes.some(n => starts(n.path, parent))) throw new Error("Missing parent");
  if (notes.some(n => starts(n.path, destination))) throw new Error("Folder already exists");
  const affected = notes.filter(n => starts(n.path, source));
  const snapshot = (items: {id: number; path: string[]}[]) => JSON.stringify(items.map(n => ({id:n.id,path:n.path})).sort((a,b) => a.id-b.id));
  if (!affected.length || snapshot(affected) !== snapshot(expected)) throw new Error("Stale folder");
  const updates = affected.map(n => ({id:n.id,path:[...destination,...n.path.slice(source.length)]}));
  if (updates.some(n => n.path.length > 12)) throw new Error("Folder too deep");
  const db = await getDb(), updatedAt = new Date().toISOString();
  db.transaction(tx => { for (const n of updates) tx.update(schema.notes).set({path:n.path,updatedAt}).where(eq(schema.notes.id,n.id)).run(); });
  saveDb();
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
