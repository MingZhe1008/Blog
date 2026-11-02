type MarkdownNode = { type: string; value?: string; children?: MarkdownNode[]; data?: { hName?: string }; position?: { start: { offset?: number }; end: { offset?: number } } };

/** Support the toolbar's <u> syntax without enabling arbitrary raw HTML in previews. */
export default function remarkUnderline() {
  return (tree: MarkdownNode) => {
    function visit(node: MarkdownNode) {
      const children = node.children;
      if (!children) return;
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        if (child.type === "html" && /^<u\s*>$/i.test(child.value || "")) {
          let depth = 1, end = index + 1;
          for (; end < children.length; end++) {
            if (children[end].type !== "html") continue;
            if (/^<u\s*>$/i.test(children[end].value || "")) depth++;
            if (/^<\/u\s*>$/i.test(children[end].value || "") && --depth === 0) break;
          }
          if (!depth) children.splice(index, end - index + 1, { type: "emphasis", data: { hName: "u" }, children: children.slice(index + 1, end), position: child.position && children[end].position ? { start: child.position.start, end: children[end].position!.end } : undefined });
        }
        visit(children[index]);
      }
    }
    visit(tree);
  };
}
