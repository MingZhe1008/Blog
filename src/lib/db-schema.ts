import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const imageAssets = sqliteTable("image_assets", {
  name: text("name").primaryKey(),
  createdAt: text("created_at").notNull(),
  lastUploadedAt: text("last_uploaded_at").notNull(),
  unreferencedSince: text("unreferenced_since"),
});
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(), description: text("description").notNull(),
  coverImage: text("cover_image").notNull().default(""),
  url: text("url").notNull().default(""), sourceUrl: text("source_url").notNull().default(""),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  status: text("status").notNull().default("持续更新"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
});
export const readingExcerpts = sqliteTable("reading_excerpts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  source: text("source").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull(),
});

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  path: text("path", { mode: "json" }).$type<string[]>().notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),       // MDX raw content
  excerpt: text("excerpt"),                  // auto-generated or manual
  coverImage: text("cover_image"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
