import { markdownPresentation } from "./markdown-presentation";

/** Number an item in its new indentation level without rewriting other lines. */
export function orderedListNumber(source: string, lineNumber: number): number | null {
  const lines = source.split("\n");
  const item = lines[lineNumber]?.match(/^([\t ]*)(\d+)([.)])(?:[\t ]|$)/);
  if (!item) return null;
  const offset = lines.slice(0, lineNumber).reduce((sum, line) => sum + line.length + 1, 0) + item[1].length;
  if (markdownPresentation(source).marks.some(mark => mark.className === "mdv-code" && mark.from <= offset && offset < mark.to)) return null;
  const width = (indent: string) => [...indent].reduce((n, char) => char === "\t" ? n + 4 - n % 4 : n + 1, 0);
  const indent = width(item[1]);
  for (let index = lineNumber - 1; index >= 0; index--) {
    const line = lines[index];
    if (!line.trim()) continue;
    const previous = line.match(/^([\t ]*)(.*)$/)!;
    const previousIndent = width(previous[1]);
    if (previousIndent < indent) break;
    if (previousIndent > indent) continue;
    const sibling = previous[2].match(/^(\d+)[.)](?:[\t ]|$)/);
    return sibling ? Number(sibling[1]) + 1 : 1;
  }
  return 1;
}
