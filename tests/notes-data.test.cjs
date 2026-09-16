const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const initSqlJs = require("sql.js");
const { drizzle } = require("drizzle-orm/sql-js");

test("notes persist hierarchy and tags, isolate drafts, and allow publishing and moving", async () => {
  const root = path.resolve(__dirname, "..");
  function compile(file, overrides = {}) {
    const mod = new Module(file, module);
    mod.filename = file;
    mod.paths = Module._nodeModulePaths(path.dirname(file));
    const original = mod.require.bind(mod);
    mod.require = name => Object.hasOwn(overrides, name) ? overrides[name] : original(name);
    mod._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText, file);
    return mod.exports;
  }
  const schema = compile(path.join(root, "src/lib/db-schema.ts"));
  const SQL = await initSqlJs();
  const database = new SQL.Database();
  const dbSource = fs.readFileSync(path.join(root, "src/lib/db.ts"), "utf8");
  const create = dbSource.match(/CREATE TABLE IF NOT EXISTS notes[\s\S]*?\n    \)/)[0];
  database.run(create);
  const db = drizzle(database, { schema });
  let saves = 0;
  const api = compile(path.join(root, "src/lib/notes.ts"), {
    "./db": { getDb: async () => db, schema, saveDb: () => saves++ }
  });
  try {
    const input = { title: "常用快捷键指令", path: ["AI相关", "ClaudeCode"], tags: ["AI", "AI", " shortcuts "], content: "## 指令\n笔记正文", status: "draft" };
    const id = await api.persistNote(input);
    assert.equal((await api.getNotes()).length, 0);
    assert.equal((await api.getNotes(false)).length, 1);
    assert.deepEqual((await api.getNote(id)).tags, ["AI", "shortcuts"]);
    await api.persistNote({ ...input, id, status: "published" });
    assert.deepEqual((await api.getNotes())[0].path, ["AI相关", "ClaudeCode"]);
    assert.equal(Object.hasOwn((await api.getNotes())[0], "content"), false);
    await api.persistNote({ ...input, id, path: ["工具", "AI", "ClaudeCode"], status: "draft" });
    assert.equal((await api.getNotes()).length, 0);
    assert.deepEqual((await api.getNote(id)).path, ["工具", "AI", "ClaudeCode"]);
    await assert.rejects(api.persistNote({ ...input, path: [""] }));
    await assert.rejects(api.persistNote({ ...input, id: 999 }));
    assert.equal(saves, 3);
    database.run(dbSource.match(/CREATE TABLE IF NOT EXISTS reading_excerpts[\s\S]*?\n  \)/)[0]);
    const excerpts = compile(path.join(root, "src/lib/reading-excerpts.ts"), {
      "./db": { getDb: async () => db, schema, saveDb: () => saves++ }
    });
    assert.deepEqual(await excerpts.getReadingExcerpts(), []);
    const entry = { text: " 摘录正文 ", source: " 测试书名 ", enabled: false };
    const excerptId = await excerpts.persistReadingExcerpt(entry);
    assert.equal((await excerpts.getReadingExcerpts()).length, 0);
    assert.equal((await excerpts.getReadingExcerpts(false))[0].text, "摘录正文");
    await excerpts.persistReadingExcerpt({ ...entry, id: excerptId, enabled: true });
    assert.equal((await excerpts.getReadingExcerpts())[0].source, "测试书名");
    await excerpts.persistReadingExcerpt({ ...entry, id: excerptId, text: "更新内容" });
    assert.equal((await excerpts.getReadingExcerpts()).length, 0);
    assert.equal((await excerpts.getReadingExcerpts(false))[0].text, "更新内容");
    for (const invalid of [{ text: " " }, { source: " " }, { enabled: "true" }, { id: 999 }, { text: "a".repeat(2001) }]) {
      await assert.rejects(excerpts.persistReadingExcerpt({ ...entry, ...invalid }));
    }
    assert.equal(saves, 6);
  } finally { database.close(); }
});
