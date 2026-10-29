import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import initSqlJs, { type SqlJsStatic, type Database as SqlJsDb } from "sql.js";
import fs from "fs";
import path from "path";
import * as schema from "./db-schema";

const DB_PATH = path.join(process.cwd(), "data", "blog.db");

let drizzleDb: SQLJsDatabase<typeof schema> | null = null;
let sqlDb: SqlJsDb | null = null;
let SQL: SqlJsStatic | null = null;
let initialization: Promise<SQLJsDatabase<typeof schema>> | null = null;

async function getSQL(): Promise<SqlJsStatic> {
  if (!SQL) {
    const wasmPath = path.join(
      process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm"
    );
    SQL = await initSqlJs({ locateFile: () => wasmPath });
  }
  return SQL;
}

function ensureTables(database: SqlJsDb) {
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
  if (drizzleDb) return drizzleDb;
  if (!initialization) initialization = initializeDb().catch(error => { initialization = null; throw error; });
  return initialization;
}

async function initializeDb(): Promise<SQLJsDatabase<typeof schema>> {
  const sql = await getSQL();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlDb = new sql.Database(buffer);
  } else {
    sqlDb = new sql.Database();
  }

  ensureTables(sqlDb);
  drizzleDb = drizzle(sqlDb, { schema });
  saveDb();
  return drizzleDb;
}

export function saveDb() {
  if (!sqlDb) return;
  const data = sqlDb.export();
  const buffer = Buffer.from(data);
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

export { schema };
