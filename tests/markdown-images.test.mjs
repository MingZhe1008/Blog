import test from "node:test";
import assert from "node:assert/strict";
import { getMarkdownImages } from "../src/lib/markdown-images.ts";

test("image widgets preserve exact offsets, adjacent text and escaped URLs", () => {
  const source = '前文 ![说明](</uploads/a b.png> "标题") 后文\n![two](/two.png)';
  const images = getMarkdownImages(source);
  assert.equal(images.length, 2);
  assert.equal(images[0].url, "/uploads/a b.png");
  assert.equal(source.slice(images[0].from, images[0].to), '![说明](</uploads/a b.png> "标题")');
  assert.equal(source.slice(0, images[0].from), "前文 ");
  assert.equal(source.slice(images[1].to), "");
});

test("code examples and escaped image syntax stay editable as text", () => {
  assert.deepEqual(getMarkdownImages('`![a](/a.png)`\n\n```md\n![b](/b.png)\n```\n\n\\![c](/c.png)'), []);
});

test("reference images resolve their definition without changing source", () => {
  const source = "![caption][cover]\n\n[cover]: /cover.png";
  assert.deepEqual(getMarkdownImages(source), [{ from: 0, to: 17, url: "/cover.png", alt: "caption" }]);
});

test("image widgets reject executable and data URLs", () => {
  assert.deepEqual(getMarkdownImages('![a](javascript:alert) ![b](data:image/svg+xml,test)'), []);
});
