import { contentUrl, sitePath } from "./site-paths";
type Element = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: Element[] };
export default function rehypeSitePaths() {
  return (tree: Element) => {
    const visit = (node: Element) => {
      if (node.type === "element" && node.properties) {
        if (typeof node.properties.src === "string") node.properties.src = sitePath(node.properties.src);
        if (typeof node.properties.href === "string") node.properties.href = contentUrl(node.properties.href);
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
