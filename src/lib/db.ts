import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import initSqlJs, { type SqlJsStatic, type Database as SqlJsDb } from "sql.js";
import fs from "fs";
import path from "path";
import * as schema from "./db-schema";

const DB_PATH = path.join(process.cwd(), "data", "blog.db");

// Share the database across route/action module instances and development reloads.
const globalDb = globalThis as typeof globalThis & { blogDatabase?: {
  drizzleDb: SQLJsDatabase<typeof schema> | null;
  sqlDb: SqlJsDb | null;
  SQL: SqlJsStatic | null;
  initialization: Promise<SQLJsDatabase<typeof schema>> | null;
} };
const state = globalDb.blogDatabase ??= { drizzleDb: null, sqlDb: null, SQL: null, initialization: null };

async function getSQL(): Promise<SqlJsStatic> {
  if (!state.SQL) {
    const wasmPath = path.join(
      process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm"
    );
    state.SQL = await initSqlJs({ locateFile: () => wasmPath });
  }
  return state.SQL;
}

function ensureTables(database: SqlJsDb) {
  database.run(`CREATE TABLE IF NOT EXISTS image_assets (
    name TEXT PRIMARY KEY, created_at TEXT NOT NULL,
    last_uploaded_at TEXT NOT NULL, unreferenced_since TEXT
  )`);
  const hasProjects = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'").length > 0;
  database.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL,
    cover_image TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', source_url TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT '持续更新', published INTEGER NOT NULL DEFAULT 0
  )`);
  if (!hasProjects) database.run(`INSERT INTO projects (title, description, url, source_url, tags, published)
    VALUES ('MingZhe 个人博客', '记录编程与 AI 实践，整理学习笔记，分享读书摘录。', '/blog', 'https://github.com/MingZhe1008/Blog', '["Next.js","TypeScript","SQLite","Tailwind CSS"]', 1)`);
  database.run(`CREATE TABLE IF NOT EXISTS reading_excerpts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL,
    source TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL
  )`);
  database.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      path TEXT NOT NULL DEFAULT '[]',
      tags TEXT NOT NULL DEFAULT '[]',
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}

export async function getDb(): Promise<SQLJsDatabase<typeof schema>> {
  if (state.drizzleDb) return state.drizzleDb;
  if (!state.initialization) state.initialization = initializeDb().catch(error => { state.initialization = null; throw error; });
  return state.initialization;
}

async function initializeDb(): Promise<SQLJsDatabase<typeof schema>> {
  const sql = await getSQL();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    state.sqlDb = new sql.Database(buffer);
  } else {
    state.sqlDb = new sql.Database();
  }

  ensureTables(state.sqlDb);
  state.drizzleDb = drizzle(state.sqlDb, { schema });
  saveDb();
  return state.drizzleDb;
}

export function saveDb() {
  if (!state.sqlDb) return;
  const data = state.sqlDb.export();
  const buffer = Buffer.from(data);
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

export { schema };
