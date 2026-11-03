import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
registerHooks({ resolve(specifier, context, nextResolve) {
  try { return nextResolve(specifier, context); }
  catch (error) { if (specifier.startsWith("./") && context.parentURL?.includes("/src/lib/")) return nextResolve(specifier + ".ts", context); throw error; }
} });
const { markdownPresentation } = await import("../src/lib/markdown-presentation.ts");
const { orderedListNumber } = await import("../src/lib/markdown-list-indent.ts");

test("indented ordered items restart or continue their destination level", () => {
  assert.equal(orderedListNumber("1. Parent\n    2. ", 1), 1);
  assert.equal(orderedListNumber("1. Parent\n    1. Child\n    3. Next", 2), 2);
  assert.equal(orderedListNumber("1. Parent\n    1. Child\n2. Next", 2), 2);
  assert.equal(orderedListNumber("```md\n    2. example\n```", 1), null);
  assert.equal(orderedListNumber("1. Parent\n    - bullet", 1), null);
});
function visible(source) {
  const { marks } = markdownPresentation(source);
  return marks.filter(mark => mark.kind !== "style").sort((a,b) => b.from - a.from).reduce((text,mark) => text.slice(0,mark.from) + (mark.kind === "bullet" ? mark.text : mark.kind === "task" ? "☐" : "") + text.slice(mark.to), source);
}
test("headings, nested emphasis, underline and links display without source delimiters", () => {
  const source = "## 标题\n\n**bold and *italic*** <u>under</u> ~~gone~~ [label](https://example.com)";
  assert.equal(visible(source), "标题\n\nbold and italic under gone label");
  const styles = markdownPresentation(source).marks.map(mark=>mark.className);
  for (const style of ["mdv-heading mdv-heading-2","mdv-bold","mdv-italic","mdv-underline","mdv-strike","mdv-link"]) assert.ok(styles.includes(style));
  assert.ok(source.includes("##"), "presentation must never rewrite the stored source");
});
test("code delimiters hide while code examples remain literal", () => {
  assert.equal(visible("`x`\n\n```md\n## literal **code**\n```"), "x\n\n## literal **code**");
  assert.equal(visible("`` `tick` ``"), "`tick`");
});
test("list markers become bullets or checkboxes and quotes lose their source prefix", () => {
  assert.equal(visible("> quote\n\n- bullet\n- [ ] task\n\n3. three"), "quote\n\n•bullet\n☐task\n\n3.three");
  assert.equal(markdownPresentation("- [x] done").marks.find(mark=>mark.kind==="task").checked,true);
});

test("empty nested list items keep their source marker editable", () => {
  for (const marker of ["1. ", "- ", "- [ ] "]) {
    const source = "1. Parent\n    " + marker;
    const offset = source.indexOf(marker, source.indexOf("\n"));
    assert.equal(markdownPresentation(source).marks.some(mark =>
      ["bullet", "task"].includes(mark.kind) && mark.from >= offset), false);
    const filled = source + "子项";
    const nested = markdownPresentation(filled).marks.find(mark =>
      ["bullet", "task"].includes(mark.kind) && mark.from >= offset);
    assert.ok(nested);
    assert.equal(filled.slice(nested.to), "子项");
  }
});
test("setext headings and escaped formatting are not confused with ATX headings", () => {
  assert.equal(visible("Title\n====="), "Title");
  assert.equal(markdownPresentation("\\## literal").marks.some(mark=>mark.className?.includes("mdv-heading")),false);
});
test("table widgets retain exact cell source offsets for targeted editing", () => {
  const source = "before\n\n| A | B |\n| --- | --- |\n| **one** | two |\n\nafter";
  const table = markdownPresentation(source).tables[0];
  assert.equal(source.slice(table.from,table.to),table.raw);
  assert.equal(table.cells[1][0].text,"one");
  for(const row of table.cells) for(const cell of row) assert.equal(source.slice(cell.from,cell.to),cell.source);
  const target=table.cells[1][1];
  const changed=source.slice(0,target.from)+"updated"+source.slice(target.to);
  assert.ok(changed.includes("| **one** | updated |"));
  assert.equal(markdownPresentation(changed).tables[0].cells[1].length,2);
});
test("hidden ranges never overlap even when formatting is nested", () => {
  const hidden = markdownPresentation("> **bold *nested***\n\n## [link](https://example.com)").marks.filter(mark=>mark.kind==="hide").sort((a,b)=>a.from-b.from);
  for(let i=1;i<hidden.length;i++) assert.ok(hidden[i-1].to<hidden[i].from);
});
test("dark and light selection colors maintain at least 7:1 text contrast", () => {
  const css=readFileSync(new URL('../src/app/admin/admin.css',import.meta.url),'utf8');
  const pairs=[...css.matchAll(/--admin-selection-bg:\s*(#[\da-f]+);\s*--admin-selection-fg:\s*(#[\da-f]+);/gi)];
  const luminance=hex=>{
    let value=hex.slice(1);if(value.length===3)value=[...value].map(char=>char+char).join('');
    return [0,2,4].map(index=>parseInt(value.slice(index,index+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
  };
  assert.equal(pairs.length,2);
  for(const [,background,foreground] of pairs){const a=luminance(background),b=luminance(foreground);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=7);}
});
