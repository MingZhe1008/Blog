import { getDb, saveDb, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export type Article = typeof schema.articles.$inferSelect;

export async function getPublishedArticles(opts?: {
  tags?: string[];
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  const { tags, page = 1, limit = 10 } = opts ?? {};

  const all = db
    .select()
    .from(schema.articles)
    .where(eq(schema.articles.status, "published"))
    .orderBy(desc(schema.articles.createdAt))
    .all();

  const filtered = tags?.length
    ? all.filter((a) => tags.some((t) => (a.tags ?? []).includes(t)))
    : all;

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const articles = filtered.slice(offset, offset + limit);

  return { articles, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  return db
    .select()
    .from(schema.articles)
    .where(eq(schema.articles.slug, slug))
    .get();
}

export async function getAllArticles() {
  const db = await getDb();
  return db
    .select()
    .from(schema.articles)
    .orderBy(desc(schema.articles.updatedAt))
    .all();
}

export async function getAllTags(): Promise<string[]> {
  const db = await getDb();
  const all = db
    .select({ tags: schema.articles.tags })
    .from(schema.articles)
    .where(eq(schema.articles.status, "published"))
    .all();
  const tagSet = new Set<string>();
  for (const row of all) {
    for (const tag of row.tags ?? []) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export async function getAdjacentArticles(slug: string) {
  const db = await getDb();
  const published = db
    .select({ slug: schema.articles.slug, title: schema.articles.title })
    .from(schema.articles)
    .where(eq(schema.articles.status, "published"))
    .orderBy(desc(schema.articles.createdAt))
    .all();

  const idx = published.findIndex((a) => a.slug === slug);
  return {
    prev: idx < published.length - 1 ? published[idx + 1] : null,
    next: idx > 0 ? published[idx - 1] : null,
  };
}

// Raw DB ops (no revalidation) — used by server actions
export async function insertArticle(data: {
  title: string; slug: string; content: string;
  excerpt?: string; coverImage?: string; tags?: string[];
  status?: "draft" | "published";
}) {
  const db = await getDb();
  const now = new Date().toISOString();

  // 检查 slug 是否已存在，重复则追加随机后缀
  let slug = data.slug;
  const existing = db
    .select({ slug: schema.articles.slug })
    .from(schema.articles)
    .where(eq(schema.articles.slug, slug))
    .all();
  if (existing.length > 0) {
    const suffix = crypto.randomBytes(3).toString("hex");
    slug = `${slug}-${suffix}`;
  }

  db.insert(schema.articles).values({
    title: data.title,
    slug,
    content: data.content,
    excerpt: data.excerpt ?? "",
    coverImage: data.coverImage ?? "",
    tags: data.tags ?? [],
    status: data.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  }).run();
  saveDb();
}

export async function updateArticleById(
  id: number,
  data: Partial<{
    title: string; slug: string; content: string;
    excerpt: string; coverImage: string; tags: string[];
    status: "draft" | "published";
  }>
) {
  const db = await getDb();
  db.update(schema.articles)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.articles.id, id))
    .run();
  saveDb();
}

export async function deleteArticleById(id: number) {
  const db = await getDb();
  db.delete(schema.articles).where(eq(schema.articles.id, id)).run();
  saveDb();
}
