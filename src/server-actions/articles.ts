"use server";

import { revalidatePath } from "next/cache";
import {
  insertArticle,
  updateArticleById,
  deleteArticleById,
} from "@/lib/data";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type { Article } from "@/lib/data";

export async function createArticle(data: {
  title: string; slug: string; content: string;
  excerpt?: string; coverImage?: string; tags?: string[];
  status?: "draft" | "published";
}) {
  await insertArticle(data);
  revalidatePath("/");
  revalidatePath("/blog");
}

export async function updateArticle(
  id: number,
  data: Partial<{
    title: string; slug: string; content: string;
    excerpt: string; coverImage: string; tags: string[];
    status: "draft" | "published";
  }>
) {
  await updateArticleById(id, data);
  revalidatePath("/");
  revalidatePath("/blog");
  if (data.slug) revalidatePath(`/blog/${data.slug}`);
}

export async function deleteArticle(id: number) {
  await deleteArticleById(id);
  revalidatePath("/");
  revalidatePath("/blog");
}

export async function importMarkdownFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const title = data.title ?? path.basename(filePath, ".md");
  const slug = data.slug ?? title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const tags = data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]) : [];
  const excerpt = data.excerpt ?? content.slice(0, 200).replace(/\n/g, " ") + "...";

  await insertArticle({ title, slug, content, excerpt, tags, status: "draft" });
  revalidatePath("/");
  return slug;
}
