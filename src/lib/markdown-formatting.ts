export type MarkdownCommand = `heading-${0 | 1 | 2 | 3 | 4 | 5 | 6}` | "bold" | "italic" | "underline" | "strike" | "inline-code" | "code-block" | "quote" | "unordered-list" | "ordered-list" | "task-list" | "link" | "rule" | "table";
export type MarkdownEdit = { from: number; to: number; text: string; selectionFrom: number; selectionTo: number };

const prefix = /^(?: {0,3}#{1,6}(?:[\t ]+|$)|>\s?|[-+*]\s+(?:\[[ xX]\]\s*)?|\d+[.)]\s+)/;
const fenceLength = (text: string) => Math.max(0, ...(text.match(/`+/g) || []).map(run => run.length));

/** A single source edit keeps CodeMirror history atomic and preserves untouched Markdown exactly. */
export function markdownEdit(source: string, from: number, to: number, command: MarkdownCommand, en = false): MarkdownEdit {
  if (from > to) [from, to] = [to, from];
  const selected = source.slice(from, to);
  const edit = (start: number, end: number, text: string, selectionFrom = start, selectionTo = start + text.length): MarkdownEdit => ({ from: start, to: end, text, selectionFrom, selectionTo });
  const wrap = (open: string, close: string, placeholder: string) => {
    const italicBoundary = open !== "*" || (((source.slice(0, from).match(/\*+$/)?.[0].length || 0) % 2 === 1) && ((source.slice(to).match(/^\*+/)?.[0].length || 0) % 2 === 1));
    if (italicBoundary && source.slice(from - open.length, from) === open && source.slice(to, to + close.length) === close) return edit(from - open.length, to + close.length, selected);
    const lines = selected.split("\n").map((line, index) => {
      const marker = (index || from === 0 || source[from - 1] === "\n") ? line.match(/^(?: {0,3}#{1,6}[\t ]+|>\s?|[-+*]\s+(?:\[[ xX]\]\s*)?|\d+[.)]\s+)/)?.[0] || "" : "";
      return { marker, body: line.slice(marker.length) };
    });
    if (selected && lines.every(({body:line}) => !line || (line.startsWith(open) && line.endsWith(close) && line.length >= open.length + close.length && (open !== "*" || ((line.match(/^\*+/)?.[0].length || 0) % 2 === 1))))) {
      return edit(from, to, lines.map(({marker,body:line}) => marker + (line ? line.slice(open.length, -close.length) : line)).join("\n"));
    }
    const text = selected || placeholder;
    const wrapped = selected ? lines.map(({marker,body:line}) => marker + (line ? open + line + close : line)).join("\n") : open + text + close;
    return edit(from, to, wrapped, from + (text.includes("\n") ? 0 : open.length + (selected ? lines[0].marker.length : 0)), from + wrapped.length - (text.includes("\n") ? 0 : close.length));
  };
  if (command === "bold") return wrap("**", "**", en ? "bold text" : "加粗文字");
  if (command === "italic") return wrap("*", "*", en ? "italic text" : "斜体文字");
  if (command === "underline") return wrap("<u>", "</u>", en ? "underlined text" : "下划线文字");
  if (command === "strike") return wrap("~~", "~~", en ? "deleted text" : "删除线文字");
  if (command === "inline-code") {
    const fence = "`".repeat(Math.max(1, fenceLength(selected) + 1));
    const pad = /^`|`$/.test(selected) ? " " : "";
    return wrap(fence + pad, pad + fence, en ? "code" : "代码");
  }
  if (command === "code-block") {
    const surrounding = source.slice(0, from).match(/(`{3,})[^\n`]*\n$/);
    if (surrounding && source.slice(to).startsWith("\n" + surrounding[1])) return edit(from - surrounding[0].length, to + surrounding[1].length + 1, selected);
    const fence = "`".repeat(Math.max(3, fenceLength(selected) + 1));
    const text = selected || (en ? "your code here" : "在此输入代码");
    const before = from && source[from - 1] !== "\n" ? "\n" : "";
    const after = to < source.length && source[to] !== "\n" ? "\n" : "";
    return edit(from, to, `${before}${fence}\n${text}\n${fence}${after}`, from + before.length + fence.length + 1, from + before.length + fence.length + 1 + text.length);
  }
  if (command === "link") {
    const label = selected || (en ? "link text" : "链接文字");
    const url = "https://example.com";
    return edit(from, to, `[${label}](${url})`, from + label.length + 3, from + label.length + 3 + url.length);
  }
  if (command === "rule" || command === "table") {
    const before = source.slice(0, from).endsWith("\n\n") || !from ? "" : source[from - 1] === "\n" ? "\n" : "\n\n";
    const content = command === "rule" ? "---" : en ? "| Column 1 | Column 2 |\n| --- | --- |\n| Content | Content |" : "| 列 1 | 列 2 |\n| --- | --- |\n| 内容 | 内容 |";
    const text = before + content + "\n\n";
    return edit(from, to, text, from + text.length, from + text.length);
  }

  const start = from === 0 ? 0 : source.lastIndexOf("\n", from - 1) + 1;
  const lastPosition = to > from && source[to - 1] === "\n" ? to - 1 : to;
  const newline = source.indexOf("\n", lastPosition);
  const end = newline < 0 ? source.length : newline;
  const lines = source.slice(start, end).split("\n");
  const heading = command.startsWith("heading-") ? Number(command.at(-1)) : null;
  const sameKind = (line: string) => command === "quote" ? /^>\s?/.test(line) : command === "task-list" ? /^[-+*]\s+\[[ xX]\]/.test(line) : command === "ordered-list" ? /^\d+[.)]\s+/.test(line) : /^[-+*]\s+(?!\[[ xX]\])/.test(line);
  const remove = heading === null && lines.filter(line => line.trim()).every(sameKind) && lines.some(line => line.trim());
  let oldOffset = start, newOffset = start, index = 0;
  const mappings: { oldStart: number; newStart: number; oldLength: number; oldPrefix: number; newPrefix: number; newLength: number }[] = [];
  const result = lines.map(line => {
    // Heading changes only replace ATX heading markers; list/quote syntax is preserved inside a heading.
    const oldPrefix = heading !== null ? (line.match(/^ {0,3}#{1,6}(?:[\t ]+|$)/)?.[0].length || 0) : command === "quote" ? (remove ? line.match(/^>\s?/)?.[0].length || 0 : 0) : (line.match(prefix)?.[0].length || 0);
    const body = line.slice(oldPrefix);
    const empty = !body.trim() && lines.length > 1;
    const marker = empty || remove ? "" : heading !== null ? (heading ? "#".repeat(heading) + " " : "") : command === "quote" ? "> " : command === "task-list" ? "- [ ] " : command === "ordered-list" ? `${++index}. ` : "- ";
    const placeholder = !body && lines.length === 1 && marker ? (en ? heading ? "Heading" : "text" : heading ? "标题" : "内容") : "";
    const text = marker + body + placeholder;
    mappings.push({ oldStart: oldOffset, newStart: newOffset, oldLength: line.length, oldPrefix, newPrefix: marker.length, newLength: text.length });
    oldOffset += line.length + 1; newOffset += text.length + 1;
    return text;
  }).join("\n");
  const mapPosition = (position: number) => {
    const line = [...mappings].reverse().find(line => line.oldStart <= position) || mappings[0];
    return line.newStart + Math.min(line.newLength, Math.max(line.newPrefix, position - line.oldStart - line.oldPrefix + line.newPrefix));
  };
  if (!selected && !source.slice(start, end)) return edit(start, end, result, start + mappings[0].newPrefix, start + result.length);
  return edit(start, end, result, mapPosition(from), to > end ? start + result.length : mapPosition(to));
}
