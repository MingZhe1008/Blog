import { desc, eq } from "drizzle-orm";
import { getDb, saveDb, schema } from "./db";
export type ReadingExcerpt = typeof schema.readingExcerpts.$inferSelect;
export type ExcerptInput = { id?: number; text: string; source: string; enabled: boolean };
export async function getReadingExcerpts(enabledOnly = true) {
  return (await getDb()).select().from(schema.readingExcerpts)
    .where(enabledOnly ? eq(schema.readingExcerpts.enabled, true) : undefined)
    .orderBy(desc(schema.readingExcerpts.id)).all();
}
export async function persistReadingExcerpt(input: ExcerptInput) {
  if (!input || typeof input.text !== "string" || !input.text.trim() || input.text.length > 2000 ||
      typeof input.source !== "string" || !input.source.trim() || input.source.length > 200 ||
      typeof input.enabled !== "boolean" ||
      (input.id !== undefined && (!Number.isSafeInteger(input.id) || input.id < 1))) throw new Error("Invalid excerpt");
  const db = await getDb();
  const values = { text: input.text.trim(), source: input.source.trim(), enabled: input.enabled, updatedAt: new Date().toISOString() };
  let id = input.id;
  if (id !== undefined) {
    if (!db.select().from(schema.readingExcerpts).where(eq(schema.readingExcerpts.id, id)).get()) throw new Error("Excerpt not found");
    db.update(schema.readingExcerpts).set(values).where(eq(schema.readingExcerpts.id, id)).run();
  } else {
    id = db.insert(schema.readingExcerpts).values(values).returning({ id: schema.readingExcerpts.id }).get().id;
  }
  saveDb();
  return id;
}
