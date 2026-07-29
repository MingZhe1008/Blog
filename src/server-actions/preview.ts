"use server";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

export async function renderMarkdown(source: string): Promise<string> {
  if (!source.trim()) return "";

  // 各版本 unified 插件类型不兼容，使用 any 桥接
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipeline = unified()
    .use(remarkParse as any)
    .use(remarkGfm as any)
    .use(remarkRehype as any)
    .use(rehypeSlug as any)
    .use(rehypeAutolinkHeadings as any, { behavior: "wrap" })
    .use(rehypePrettyCode as any, {
      theme: "github-dark-dimmed",
      keepBackground: true,
    })
    .use(rehypeStringify as any);

  const result = await pipeline.process(source);
  return String(result);
}
