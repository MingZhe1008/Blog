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
  assert.doesNotMatch(background, /motionEnabled/);
});

test("navigation retains accessible labels and current-page semantics", async () => {
  const header = await read("src/components/header.tsx");

  assert.match(header, /aria-current/);
  assert.match(header, /aria-label/);
});

test("home keeps article lists hidden while retaining the blog entry point", async () => {
  const home = await read("src/app/(main)/home-view.tsx");
  const styles = await read("src/app/editorial.css");

  assert.doesNotMatch(home, /ArticleCard|featured-section|recent-section/);
  assert.match(home, /href="\/blog"/);
  assert.match(styles, /\.reading-excerpt[^}]*border-block:/);
  assert.doesNotMatch(styles, /\.topics-section[^}]*border-top:/);
  assert.match(styles, /\.topic-links a,[^}]*background:\s*transparent/);
});

test("the star field keeps rotating independently from CSS motion preferences", async () => {
  const styles = await read("src/app/globals.css");
  const background = await read("src/components/star-background.tsx");

  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /animation-duration:\s*0\.01ms/);
  assert.doesNotMatch(background, /matchMedia/);
  assert.match(background, /useFrame/);
});

test("light atlas tokens and filter state meet accessibility contracts", async () => {
  const styles = await read("src/app/globals.css");
  const filter = await read("src/components/tag-filter.tsx");

  const luminance = (hex) => {
    const rgb = hex.match(/\w{2}/g).map(v => parseInt(v, 16) / 255)
      .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  for (const selector of ["@theme", ".light"]) {
    const block = styles.slice(styles.indexOf(selector)).split("}")[0];
    const token = name => block.match(new RegExp(`--color-${name}:\\s*#([a-f0-9]{6})`))[1];
    const surface = luminance(token("bg-surface"));
    for (const name of ["text-primary", "text-secondary", "text-muted", "accent"]) {
      const hex = token(name);
      assert.equal(hex.slice(0, 2), hex.slice(2, 4), `${name} is neutral`);
      assert.equal(hex.slice(2, 4), hex.slice(4, 6), `${name} is neutral`);
      const ink = luminance(hex);
      assert.ok((Math.max(ink, surface) + 0.05) / (Math.min(ink, surface) + 0.05) >= 4.5, `${selector} ${name} contrast`);
    }
  }
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
  assert.doesNotMatch(home, /featured-section|recent-section|ArticleCard/);
  assert.match(blog, /t\("fieldLabel"\)/);
  assert.match(header, /t\("navLabel"\)/);
});
