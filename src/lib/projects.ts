import { eq, desc } from "drizzle-orm";
import { getDb, saveDb, schema } from "./db";
export type Project = typeof schema.projects.$inferSelect;
export async function getProjects(all = false) {
  return (await getDb()).select().from(schema.projects)
    .where(all ? undefined : eq(schema.projects.published, true)).orderBy(desc(schema.projects.id)).all();
}
export function safeProjectUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}
export async function persistProject(input: Omit<Project, "id"> & { id?: number }) {
  if (!input.title?.trim() || input.title.length > 200 || !input.description?.trim() || input.description.length > 5000 ||
    !Array.isArray(input.tags) || input.tags.some(t => typeof t !== "string" || t.length > 100) ||
    typeof input.status !== "string" || input.status.length > 30 || typeof input.published !== "boolean" ||
    ![input.url, input.sourceUrl, input.coverImage].every(v => typeof v === "string" && safeProjectUrl(v)) ||
    (input.id !== undefined && (!Number.isSafeInteger(input.id) || input.id < 1))) throw new Error("Invalid project");
  const db = await getDb();
  const { id, ...values } = input;
  values.title = values.title.trim();
  values.tags = [...new Set(values.tags.map(t => t.trim()).filter(Boolean))];
  if (id) {
    if (!db.select().from(schema.projects).where(eq(schema.projects.id, id)).get()) throw new Error("Project not found");
    db.update(schema.projects).set(values).where(eq(schema.projects.id, id)).run();
  } else db.insert(schema.projects).values(values).run();
  saveDb();
}
export async function removeProject(id: number) {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid id");
  (await getDb()).delete(schema.projects).where(eq(schema.projects.id, id)).run();
  saveDb();
}
