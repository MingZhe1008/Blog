"use server";

import { withImageContentWrite } from "@/lib/image-library";
import { revalidatePath } from "next/cache";
import {
  insertArticle,
  updateArticleById,
  deleteArticleById,
} from "@/lib/data";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { isAdminAuthenticated } from "@/lib/admin-auth";
async function requireAdmin() { if (!await isAdminAuthenticated()) throw new Error("登录已失效，请重新登录管理台。"); }

export async function createArticle(data: {
  title: string; slug: string; content: string;
  excerpt?: string; coverImage?: string; tags?: string[];
  status?: "draft" | "published";
}) {
  await requireAdmin();
  await withImageContentWrite(() => insertArticle(data));
  revalidatePath("/admin");
  revalidatePath("/admin/images");
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
  await requireAdmin();
  await withImageContentWrite(() => updateArticleById(id, data));
  revalidatePath("/admin");
  revalidatePath("/admin/images");
  revalidatePath(`/admin/editor/${id}`);
  revalidatePath("/");
  revalidatePath("/blog");
  if (data.slug) revalidatePath(`/blog/${data.slug}`);
}

export async function deleteArticle(id: number) {
  await requireAdmin();
  await withImageContentWrite(() => deleteArticleById(id));
  revalidatePath("/admin");
  revalidatePath("/admin/images");
  revalidatePath("/");
  revalidatePath("/blog");
}

export async function importMarkdownFile(filePath: string) {
  await requireAdmin();
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const title = data.title ?? path.basename(filePath, ".md");
  const slug = data.slug ?? title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const tags = data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]) : [];
  const excerpt = data.excerpt ?? content.slice(0, 200).replace(/\n/g, " ") + "...";

  await withImageContentWrite(() => insertArticle({ title, slug, content, excerpt, tags, status: "draft" }));
  revalidatePath("/");
  revalidatePath("/admin/images");
  revalidatePath("/admin");
  return slug;
}
