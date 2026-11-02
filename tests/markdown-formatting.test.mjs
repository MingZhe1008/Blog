import test from "node:test";
import assert from "node:assert/strict";
import { markdownEdit } from "../src/lib/markdown-formatting.ts";
import remarkUnderline from "../src/lib/remark-underline.ts";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

function apply(source, from, to, command) {
  const edit = markdownEdit(source, from, to, command);
  return { source: source.slice(0, edit.from) + edit.text + source.slice(edit.to), from: edit.selectionFrom, to: edit.selectionTo };
}

test("heading changes preserve surrounding content, cursor position and excluded trailing line", () => {
  const source = "before\n## title\nafter";
  const heading = apply(source, 12, 12, "heading-4");
  assert.equal(heading.source, "before\n#### title\nafter");
  assert.equal(heading.from, 14);
  const paragraph = apply(heading.source, heading.from, heading.to, "heading-0");
  assert.equal(paragraph.source, "before\ntitle\nafter");
  assert.equal(paragraph.from, 9);
  assert.equal(apply("a\nb\nc", 0, 4, "heading-2").source, "## a\n## b\nc");
  const empty = apply("", 0, 0, "heading-1");
  assert.equal(empty.source.slice(empty.from, empty.to), "标题");
});

test("inline formats toggle, preserve selections and do not confuse italic with bold", () => {
  for (const command of ["bold", "italic", "underline", "strike", "inline-code"]) {
    const formatted = apply("before word after", 7, 11, command);
    assert.equal(formatted.source.slice(formatted.from, formatted.to), "word");
    assert.equal(apply(formatted.source, formatted.from, formatted.to, command).source, "before word after");
  }
  assert.equal(apply("**bold**", 2, 6, "italic").source, "***bold***");
  assert.equal(apply("***both***", 3, 7, "italic").source, "**both**");
  assert.equal(apply("**bold**", 0, 8, "italic").source, "***bold***");
  assert.equal(apply("a\n\nb", 0, 4, "underline").source, "<u>a</u>\n\n<u>b</u>");
});

test("lists switch types and toggle without duplicating prefixes", () => {
  assert.equal(apply("- a\n- b", 0, 7, "ordered-list").source, "1. a\n2. b");
  assert.equal(apply("1. a\n2. b", 0, 9, "ordered-list").source, "a\nb");
  assert.equal(apply("- a\n- b", 0, 7, "task-list").source, "- [ ] a\n- [ ] b");
  assert.equal(apply("> a\n> b", 0, 7, "quote").source, "a\nb");
  assert.equal(apply("# Heading", 0, 9, "quote").source, "> # Heading");
});

test("code blocks use longer fences, undo wrapping and preserve adjacent text", () => {
  const block = apply("start code end", 6, 10, "code-block");
  assert.equal(block.source, "start \n```\ncode\n```\n end");
  assert.equal(block.source.slice(block.from, block.to), "code");
  assert.equal(apply(block.source, block.from, block.to, "code-block").source, "start \ncode\n end");
  assert.ok(apply("```js\na\n```", 0, 11, "code-block").source.startsWith("````\n"));
  assert.equal(apply("a`b", 0, 3, "inline-code").source, "``a`b``");
});

test("link target is selected and block insertion does not consume neighboring text", () => {
  const link = apply("a title b", 2, 7, "link");
  assert.equal(link.source, "a [title](https://example.com) b");
  assert.equal(link.source.slice(link.from, link.to), "https://example.com");
  assert.equal(apply("beforeafter", 6, 6, "rule").source, "before\n\n---\n\nafter");
  assert.ok(apply("", 0, 0, "table").source.includes("| --- | --- |"));
});

test("preview renders toolbar underline plus nested Markdown without allowing arbitrary HTML", async () => {
  const result = await unified().use(remarkParse).use(remarkGfm).use(remarkUnderline).use(remarkRehype).use(rehypeStringify).process('<u>under **bold**</u> and <u>second</u>\n\n<script>alert(1)</script>\n\n`<u>code</u>`');
  const html = String(result);
  assert.ok(html.includes("<u>under <strong>bold</strong></u> and <u>second</u>"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("<code>&#x3C;u>code&#x3C;/u></code>"));
});
