import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { getDb, saveDb, schema } from "./db";
import { collectImageUsage, imageLifecycle, validImageName, type ImageSource, type ImageUsage } from "./image-policy";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const globalQueue = globalThis as typeof globalThis & { imageLibraryQueue?: Promise<unknown> };
export function withImageLibraryLock<T>(work: () => Promise<T>): Promise<T> {
  const result = (globalQueue.imageLibraryQueue || Promise.resolve()).then(work);
  globalQueue.imageLibraryQueue = result.then(() => {}, () => {});
  return result;
}

export interface UploadedImage {
  name: string; url: string; size: number; lastModified: string;
  status: "used" | "temporary" | "unused";
  cleanupAfter: string | null;
  references: ImageUsage[];
}

async function usageIndex() {
  const db = await getDb();
  const sources: ImageSource[] = [];
  for (const article of db.select().from(schema.articles).all()) sources.push({ kind: "article", title: article.title, href: `/admin/editor/${article.id}`, status: article.status, fields: [article.content, article.coverImage, article.excerpt] });
  for (const note of db.select().from(schema.notes).all()) sources.push({ kind: "note", title: note.title, href: `/admin/notes/${note.id}`, status: note.status, fields: [note.content] });
  for (const project of db.select().from(schema.projects).all()) sources.push({ kind: "project", title: project.title, href: `/admin/projects#project-${project.id}`, status: project.published ? "published" : "draft", fields: [project.coverImage, project.description, project.url, project.sourceUrl] });
  return collectImageUsage(sources);
}

/** Must be called under the shared lock. First-time legacy files receive a full grace period. */
async function synchronize(): Promise<UploadedImage[]> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const db = await getDb();
  const usage = await usageIndex();
  const known = new Map(db.select().from(schema.imageAssets).all().map(asset => [asset.name, asset]));
  const now = new Date().toISOString();
  const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
  const images: UploadedImage[] = [];
  let dirty = false;
  for (const entry of entries) {
    if (!entry.isFile() || !validImageName(entry.name)) continue;
    const stat = await fs.stat(path.join(UPLOAD_DIR, entry.name));
    const references = usage.get(entry.name) || [];
    let asset = known.get(entry.name);
    if (!asset) {
      asset = { name: entry.name, createdAt: stat.mtime.toISOString(), lastUploadedAt: now, unreferencedSince: references.length ? null : now };
      db.insert(schema.imageAssets).values(asset).run(); dirty = true;
    } else {
      const unreferencedSince = references.length ? null : (asset.unreferencedSince || now);
      if (unreferencedSince !== asset.unreferencedSince) {
        db.update(schema.imageAssets).set({ unreferencedSince }).where(eq(schema.imageAssets.name, entry.name)).run();
        asset.unreferencedSince = unreferencedSince; dirty = true;
      }
    }
    known.delete(entry.name);
    images.push({ name: entry.name, url: `/uploads/${entry.name}`, size: stat.size, lastModified: asset.createdAt, references,
      ...imageLifecycle(references.length, asset.lastUploadedAt, asset.unreferencedSince, Date.parse(now)) });
  }
  for (const name of known.keys()) { db.delete(schema.imageAssets).where(eq(schema.imageAssets.name, name)).run(); dirty = true; }
  if (dirty) saveDb();
  return images.sort((a, b) => b.lastModified.localeCompare(a.lastModified));
}

export const getImageLibrary = () => withImageLibraryLock(synchronize);

/** Serialize content writes against deletion; capture transitions even without visiting the library. */
export function withImageContentWrite<T>(work: () => Promise<T>) {
  return withImageLibraryLock(async () => {
    await synchronize();
    const result = await work();
    await synchronize();
    return result;
  });
}

export function storeImage(buffer: Buffer, extension: string) {
  return withImageLibraryLock(async () => {
    const images = await synchronize();
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    // Check legacy files too, preferring an already referenced copy; existing URLs are never rewritten.
    const candidates = images.filter(image => image.size === buffer.length).sort((a, b) => b.references.length - a.references.length);
    let name = `${hash}${extension}`;
    let reused = false;
    for (const image of candidates) {
      const content = await fs.readFile(path.join(UPLOAD_DIR, image.name));
      if (crypto.createHash("sha256").update(content).digest("hex") === hash) { name = image.name; reused = true; break; }
    }
    if (!reused) await fs.writeFile(path.join(UPLOAD_DIR, name), buffer, { flag: "wx" });
    const db = await getDb(); const now = new Date().toISOString();
    db.insert(schema.imageAssets).values({ name, createdAt: now, lastUploadedAt: now, unreferencedSince: now })
      .onConflictDoUpdate({ target: schema.imageAssets.name, set: { lastUploadedAt: now } }).run();
    saveDb();
    return { url: `/uploads/${name}`, reused };
  });
}

export function retainImage(name: string) {
  return withImageLibraryLock(async () => {
    const image = (await synchronize()).find(image => image.name === name);
    if (!image) throw new Error("图片不存在 / Image not found");
    (await getDb()).update(schema.imageAssets).set({ lastUploadedAt: new Date().toISOString() }).where(eq(schema.imageAssets.name, name)).run();
    saveDb();
  });
}

/** Explicit single deletion may remove a temporary file; batch cleanup only accepts expired candidates. */
export function removeImages(names: string[], expiredOnly: boolean) {
  return withImageLibraryLock(async () => {
    if (!names.length || names.length > 200 || names.some(name => !validImageName(name))) throw new Error("无效的图片选择 / Invalid image selection");
    const images = new Map((await synchronize()).map(image => [image.name, image]));
    const db = await getDb(); const deleted: string[] = []; const skipped: string[] = [];
    for (const name of new Set(names)) {
      const image = images.get(name);
      if (!image || image.references.length || (expiredOnly && image.status !== "unused")) { skipped.push(name); continue; }
      try { await fs.unlink(path.join(UPLOAD_DIR, name)); }
      catch { skipped.push(name); continue; }
      db.delete(schema.imageAssets).where(eq(schema.imageAssets.name, name)).run(); deleted.push(name);
    }
    if (deleted.length) saveDb();
    return { deleted, skipped };
  });
}
