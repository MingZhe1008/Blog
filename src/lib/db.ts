import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import fs from "fs";
import path from "path";
import * as schema from "./db-schema";

const DB_PATH = path.join(process.cwd(), "data", "blog.db");

let db: SQLJsDatabase<typeof schema> | null = null;
let SQL: SqlJsStatic | null = null;

async function getSQL(): Promise<SqlJsStatic> {
  if (!SQL) {
    const wasmPath = path.join(
      process.cwd(),
      "node_modules",
      "sql.js",
      "dist",
      "sql-wasm.wasm"
    );
    SQL = await initSqlJs({ locateFile: () => wasmPath });
  }
  return SQL;
}

function loadDb(sql: SqlJsStatic): SQLJsDatabase<typeof schema> {
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    const database = new sql.Database(buffer);
    ensureTables(database);
    return drizzle(database, { schema });
  }
  const database = new sql.Database();
  ensureTables(database);
  return drizzle(database, { schema });
}

function ensureTables(database: import("sql.js").Database) {
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
  if (db) return db;
  const sql = await getSQL();
  db = loadDb(sql);
  return db;
}

export function saveDb() {
  if (!db) return;
  const client = (db as unknown as { $client: import("sql.js").Database }).$client;
  const data = client.export();
  const buffer = Buffer.from(data);
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

export { schema };
