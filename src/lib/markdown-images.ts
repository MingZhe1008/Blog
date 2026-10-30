import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Image, ImageReference, Root, Content } from "mdast";

const parser = unified().use(remarkParse);

/** Source offsets let the editor replace image syntax visually without rewriting Markdown. */
export function getMarkdownImages(source: string) {
  const tree = parser.parse(source) as Root;
  const definitions = new Map(tree.children.filter(node => node.type === "definition").map(node => [node.identifier.toLowerCase(), node.url]));
  const images: { from: number; to: number; url: string; alt: string }[] = [];
  function visit(node: Root | Content) {
    if (node.type === "image" || node.type === "imageReference") {
      const image = node as Image | ImageReference;
      const url = image.type === "image" ? image.url : definitions.get(image.identifier.toLowerCase());
      const from = image.position?.start.offset;
      const to = image.position?.end.offset;
      // Match the protocols accepted by the public Markdown renderer; never put script URLs in DOM.
      if (url && !/^(?:\s*(?:javascript|vbscript|data):)/i.test(url) && from !== undefined && to !== undefined) {
        images.push({ from, to, url, alt: image.alt || "" });
      }
    } else if ("children" in node) {
      for (const child of node.children) visit(child as Content);
    }
  }
  visit(tree);
  return images;
}
