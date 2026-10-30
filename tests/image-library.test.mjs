import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { collectImageUsage, imageLifecycle, validImageName, IMAGE_RETENTION_MS } from "../src/lib/image-policy.ts";

registerHooks({ resolve(specifier, context, nextResolve) {
  try { return nextResolve(specifier, context); }
  catch (error) {
    if (specifier.startsWith("./") && context.parentURL?.includes("/src/lib/")) return nextResolve(specifier + ".ts", context);
    throw error;
  }
} });

test("usage detection covers Markdown, MDX, encoded URLs, queries and all saved statuses", () => {
  const source = { kind: "article", title: "Draft", href: "/admin/editor/1", status: "draft" };
  const usage = collectImageUsage([
    { ...source, fields: ['![a](/uploads/a.png?size=2) <img src={"/uploads/b.png"}/>', "/uploads/a.png", "https://example.test/uploads/c.png#top"] },
    { ...source, kind: "note", href: "/admin/notes/2", status: "published", fields: ["100% %2Fuploads%2Fa.png &#47;uploads&#47;d.png /uploads/e.png."] },
    { ...source, kind: "project", href: "/admin/projects#project-3", fields: ["/uploads/a.png.extra", "/uploads/ab.png"] },
  ]);
  assert.equal(usage.get("a.png").length, 2);
  assert.equal(usage.get("b.png")[0].status, "draft");
  assert.ok(usage.has("c.png") && usage.has("d.png"));
  assert.ok(usage.has("e.png"));
  assert.equal(usage.get("a.png.extra"), undefined);
  assert.equal(usage.get("ab.png").length, 1);
});

test("retention uses both upload renewal and last-reference removal, including exact expiry", () => {
  const start = Date.parse("2026-10-01T00:00:00Z");
  const iso = value => new Date(value).toISOString();
  assert.equal(imageLifecycle(1, iso(start), null, start + IMAGE_RETENTION_MS * 2).status, "used");
  assert.equal(imageLifecycle(0, iso(start), iso(start), start + IMAGE_RETENTION_MS - 1).status, "temporary");
  assert.equal(imageLifecycle(0, iso(start), iso(start), start + IMAGE_RETENTION_MS).status, "unused");
  assert.equal(imageLifecycle(0, iso(start + IMAGE_RETENTION_MS), iso(start), start + IMAGE_RETENTION_MS).status, "temporary");
  assert.equal(imageLifecycle(0, iso(start), iso(start + IMAGE_RETENTION_MS), start + IMAGE_RETENTION_MS).status, "temporary");
  for (const bad of ["../a.png", "x/evil.png", "x\\evil.png", "a..png", "a.txt", ""]) assert.equal(validImageName(bad), false);
});

test("isolated library: deduplication, draft protection, renewal, reference transitions and safe cleanup", async () => {
  const repo = process.cwd();
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "blog-image-library-"));
  assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
  try {
    await fs.symlink(path.join(repo, "node_modules"), path.join(root, "node_modules"), process.platform === "win32" ? "junction" : "dir");
    process.chdir(root);
    const { getDb, saveDb, schema } = await import("../src/lib/db.ts");
    const { getImageLibrary, storeImage, removeImages, retainImage, withImageContentWrite } = await import("../src/lib/image-library.ts");
    const db = await getDb();
    const anotherModule = await import("../src/lib/db.ts?route-instance");
    assert.equal(await anotherModule.getDb(), db, "route/action module instances must share current database state");
    const bytes = Buffer.from("isolated image content");
    const [first, second] = await Promise.all([storeImage(bytes, ".png"), storeImage(bytes, ".png")]);
    assert.equal(first.url, second.url); assert.equal(second.reused, true);
    const name = first.url.split("/").at(-1);
    let library = await getImageLibrary(); assert.equal(library.length, 1); assert.equal(library[0].status, "temporary");
    assert.deepEqual((await removeImages([name], true)).deleted, []);
    const old = new Date(Date.now() - 8 * 86400000).toISOString();
    await fs.writeFile(path.join(root, "public/uploads/legacy.png"), Buffer.from("legacy bytes"));
    const legacy = await storeImage(Buffer.from("legacy bytes"), ".png"); assert.equal(legacy.url, "/uploads/legacy.png"); assert.equal(legacy.reused, true);
    await withImageContentWrite(async () => {
      db.insert(schema.articles).values({ title: "Draft", slug: "draft", content: `![a](${first.url})`, status: "draft", createdAt: old, updatedAt: old }).run();
      db.insert(schema.notes).values({ title: "Note", path: [], tags: [], content: `<img src="${first.url}" />`, status: "published", createdAt: old, updatedAt: old }).run();
      db.insert(schema.projects).values({ title: "Project", description: "Test", tags: [], coverImage: first.url, published: false }).run(); saveDb();
    });
    library = await getImageLibrary(); const referenced = library.find(image => image.name === name);
    assert.equal(referenced.status, "used"); assert.equal(referenced.references.length, 3);
    assert.deepEqual((await removeImages([name], false)).skipped, [name]);
    db.update(schema.imageAssets).set({ lastUploadedAt: old }).where(eq(schema.imageAssets.name, name)).run(); saveDb();
    await withImageContentWrite(async () => {
      db.delete(schema.articles).where(eq(schema.articles.slug, "draft")).run();
      db.delete(schema.notes).where(eq(schema.notes.title, "Note")).run();
      db.delete(schema.projects).where(eq(schema.projects.title, "Project")).run(); saveDb();
    });
    library = await getImageLibrary(); assert.equal(library.find(image => image.name === name).status, "temporary");
    db.update(schema.imageAssets).set({ lastUploadedAt: old, unreferencedSince: old }).where(eq(schema.imageAssets.name, name)).run(); saveDb();
    assert.equal((await getImageLibrary()).find(image => image.name === name).status, "unused");
    await retainImage(name); assert.equal((await getImageLibrary()).find(image => image.name === name).status, "temporary");
    db.update(schema.imageAssets).set({ lastUploadedAt: old, unreferencedSince: old }).where(eq(schema.imageAssets.name, name)).run(); saveDb();
    // A stale UI candidate cannot override a reference added before the cleanup request.
    await getImageLibrary();
    await withImageContentWrite(async () => {
      db.insert(schema.articles).values({ title: "New reference", slug: "new-reference", content: first.url, status: "published", createdAt: old, updatedAt: old }).run(); saveDb();
    });
    assert.deepEqual((await removeImages([name], true)).skipped, [name]);
    await withImageContentWrite(async () => { db.delete(schema.articles).where(eq(schema.articles.slug, "new-reference")).run(); saveDb(); });
    db.update(schema.imageAssets).set({ lastUploadedAt: old, unreferencedSince: old }).where(eq(schema.imageAssets.name, name)).run(); saveDb();
    const cleaned = await removeImages([name, "legacy.png"], true);
    assert.deepEqual(cleaned.deleted, [name]); assert.deepEqual(cleaned.skipped, ["legacy.png"]);
    await assert.rejects(fs.stat(path.join(root, "public/uploads", name)), { code: "ENOENT" });
    assert.deepEqual((await getImageLibrary()).map(image => image.name), ["legacy.png"]);
    await assert.rejects(removeImages(["../legacy.png"], false));
  } finally {
    process.chdir(repo);
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    await fs.rm(root, { recursive: true, force: true });
  }
});
