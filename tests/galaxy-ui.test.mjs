import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public layout mounts the rotating space-portfolio star field", async () => {
  const layout = await read("src/app/(main)/layout.tsx");
  const background = await read("src/components/star-background.tsx");

  assert.match(layout, /StarsCanvas/);
  assert.match(background, /aria-hidden="true"/);
  assert.match(background, /random\.inSphere\(new Float32Array\(5000\)/);
  assert.match(background, /rotation\.x -= delta \/ 10/);
  assert.match(background, /rotation\.y -= delta \/ 15/);
  assert.match(background, /prefers-reduced-motion: reduce/);
});

test("navigation uses celestial destinations with accessible labels", async () => {
  const header = await read("src/components/header.tsx");

  assert.match(header, /celestial-nav/);
  assert.match(header, /nav-orb--sun/);
  assert.match(header, /nav-orb--cluster/);
  assert.match(header, /aria-label/);
});

test("home renders article destinations as galaxy nodes", async () => {
  const home = await read("src/app/(main)/home-view.tsx");
  const node = await read("src/components/galaxy-node.tsx");

  assert.match(home, /GalaxyNode/);
  assert.match(node, /galaxy-node__core/);
  assert.match(node, /\/blog\/\$\{article\.slug\}/);
});

test("motion stops when the visitor requests reduced motion", async () => {
  const styles = await read("src/app/globals.css");
  const background = await read("src/components/star-background.tsx");

  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /animation-duration:\s*0\.01ms/);
  assert.match(background, /setMotionEnabled\(!mediaQuery\.matches\)/);
});

test("light atlas tokens and filter state meet accessibility contracts", async () => {
  const styles = await read("src/app/globals.css");
  const filter = await read("src/components/tag-filter.tsx");

  assert.match(styles, /--color-text-muted:\s*#526879/);
  assert.match(styles, /--color-accent:\s*#006d6a/);
  assert.match(filter, /aria-pressed/);
  assert.match(filter, /role="group"/);
});

test("new visitors enter through the dark galaxy theme", async () => {
  const rootLayout = await read("src/app/layout.tsx");

  assert.match(rootLayout, /defaultTheme="dark"/);
  assert.match(rootLayout, /storageKey="galaxy-theme"/);
  assert.match(rootLayout, /enableSystem=\{false\}/);
});

test("new celestial interface copy stays inside the locale message catalog", async () => {
  const messages = await read("src/components/i18n-provider.tsx");
  const home = await read("src/app/(main)/home-view.tsx");
  const blog = await read("src/app/(main)/blog/blog-list-view.tsx");
  const header = await read("src/components/header.tsx");

  assert.match(messages, /navLabel:\s*"主导航"/);
  assert.match(messages, /fieldLog:\s*"星域记录/);
  assert.match(messages, /fieldLabel:\s*"星域 01/);
  assert.match(home, /t\("fieldLog"\)/);
  assert.match(blog, /t\("fieldLabel"\)/);
  assert.match(header, /t\("navLabel"\)/);
});
