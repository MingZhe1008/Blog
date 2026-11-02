import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkUnderline from "./remark-underline";

type Node = { type: string; value?: string; depth?: number; ordered?: boolean; start?: number; checked?: boolean | null; children?: Node[]; data?: { hName?: string }; position?: { start: { offset?: number }; end: { offset?: number } } };
export type PresentationMark = { from: number; to: number; kind: "hide" | "style" | "bullet" | "task" | "rule"; className?: string; text?: string; checked?: boolean; opening?: boolean };
export type PresentationTable = { from: number; to: number; raw: string; cells: { from: number; to: number; source: string; text: string }[][] };
const parser = unified().use(remarkParse).use(remarkGfm).use(remarkUnderline);

/** Read-only presentation ranges. Applying these decorations never serializes or changes the document. */
export function markdownPresentation(source: string) {
  const tree = parser.runSync(parser.parse(source)) as Node;
  const marks: PresentationMark[] = [];
  const tables: PresentationTable[] = [];
  const range = (node: Node) => ({ from: node.position?.start.offset ?? 0, to: node.position?.end.offset ?? 0 });
  const add = (from: number, to: number, kind: PresentationMark["kind"], rest: Partial<PresentationMark> = {}) => { if (to > from) marks.push({ from, to, kind, ...rest }); };
  const plain = (node: Node): string => node.value ?? node.children?.map(plain).join("") ?? "";
  function visit(node: Node, parent?: Node, itemIndex = 0) {
    const { from, to } = range(node);
    const children = node.children || [];
    const first = children[0] && range(children[0]).from;
    const last = children.length ? range(children[children.length - 1]).to : to;
    if (node.type === "table") {
      tables.push({ from, to, raw: source.slice(from, to), cells: children.map(row => (row.children || []).map(cell => {
        const contents = cell.children || [];
        const raw = range(cell);
        const start = contents.length ? range(contents[0]).from : raw.from + (source.slice(raw.from, raw.to).match(/^\|?[\t ]*/)?.[0].length || 0);
        const end = contents.length ? range(contents[contents.length - 1]).to : start;
        return { from: start, to: end, source: source.slice(start, end), text: plain(cell) };
      })) });
      return;
    }
    if (node.type === "heading" || node.type === "strong" || node.type === "emphasis" || node.type === "delete" || node.type === "link" || node.type === "linkReference") {
      if (first !== undefined) {
        add(from, first, "hide", { opening: true }); add(last, to, "hide");
        const className = node.type === "heading" ? `mdv-heading mdv-heading-${node.depth}` : node.type === "emphasis" ? node.data?.hName === "u" ? "mdv-underline" : "mdv-italic" : node.type === "strong" ? "mdv-bold" : node.type === "delete" ? "mdv-strike" : "mdv-link";
        add(first, last, "style", { className });
      }
    } else if (node.type === "inlineCode") {
      const raw = source.slice(from, to), fence = raw.match(/^`+/)?.[0].length || 1;
      const pad = raw[fence] === " " && raw[raw.length - fence - 1] === " " && raw.slice(fence, -fence).trim() ? 1 : 0;
      add(from, from + fence + pad, "hide", { opening: true }); add(to - fence - pad, to, "hide");
      add(from + fence + pad, to - fence - pad, "style", { className: "mdv-inline-code" });
    } else if (node.type === "code") {
      const raw = source.slice(from, to);
      const opening = raw.match(/^ {0,3}(`{3,}|~{3,})[^\n]*\n/);
      let start = from, end = to;
      if (opening) {
        start += opening[0].length; add(from, start, "hide", { opening: true });
        const lastNewline = raw.lastIndexOf("\n");
        const close = raw.slice(lastNewline + 1).trim();
        if (close.length >= opening[1].length && [...close].every(char => char === opening[1][0])) { end = from + lastNewline; add(end, to, "hide"); }
      }
      add(start, end, "style", { className: "mdv-code" });
    } else if (node.type === "blockquote") {
      let position = from;
      for (const line of source.slice(from, to).split("\n")) {
        const prefix = line.match(/^ {0,3}>[\t ]?/);
        if (prefix) add(position, position + prefix[0].length, "hide", { opening: true });
        position += line.length + 1;
      }
      add(from, to, "style", { className: "mdv-quote" });
    } else if (node.type === "listItem") {
      const prefix = source.slice(from, to).match(/^(?:[-+*]|\d+[.)])[\t ]+(?:\[([ xX])\][\t ]+)?/);
      if (prefix) add(from, from + prefix[0].length, typeof node.checked === "boolean" ? "task" : "bullet", { text: parent?.ordered ? `${(parent.start || 1) + itemIndex}.` : "•", checked: !!node.checked });
    } else if (node.type === "thematicBreak") add(from, to, "rule");
    else if (node.type === "definition") add(from, to, "hide");
    // Code, definitions and tables are opaque. Never interpret formatting in code examples.
    if (!["code", "inlineCode", "definition"].includes(node.type)) children.forEach((child, index) => visit(child, node, index));
  }
  visit(tree);
  // Nested blockquote/list prefixes can overlap. Collapse their union once.
  const hidden = marks.filter(mark => mark.kind === "hide").sort((a, b) => a.from - b.from);
  const merged: PresentationMark[] = [];
  for (const mark of hidden) {
    const previous = merged.at(-1);
    if (previous && previous.to >= mark.from) { previous.to = Math.max(previous.to, mark.to); previous.opening ||= mark.opening; }
    else merged.push({ ...mark });
  }
  return { marks: [...marks.filter(mark => mark.kind !== "hide"), ...merged], tables };
}
