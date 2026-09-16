import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("global search opens with Ctrl+F and provides accessible keyboard controls", async () => {
  const component = await read("src/components/global-search.tsx");
  const header = await read("src/components/header.tsx");
  assert.match(header, /<GlobalSearch \/>/);
  assert.match(component, /event\.ctrlKey/);
  assert.match(component, /event\.preventDefault\(\)/);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /event\.key === "ArrowDown"/);
  assert.match(component, /role="dialog"/);
  assert.match(component, /aria-modal="true"/);
});

test("search endpoint only returns published article and note destinations", async () => {
  const route = await read("src/app/api/search/route.ts");
  assert.match(route, /getPublishedArticles/);
  assert.match(route, /getNotes\(\)/);
  assert.match(route, /\/blog\/\$\{article\.slug\}/);
  assert.match(route, /\/notes\/\$\{note\.id\}/);
  assert.match(route, /slice\(0, 10\)/);
});
