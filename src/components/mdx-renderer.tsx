import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import rehypeSitePaths from "@/lib/rehype-site-paths";
import { sitePath, contentUrl } from "@/lib/site-paths";

export function MDXContent({ source }: { source: string }) {
  return (
    <div className="prose">
      <MDXRemote
        source={source}
        components={{ img: ({ src, ...props }) => <img {...props} src={typeof src === "string" ? sitePath(src) : src} />, a: ({ href, ...props }) => <a {...props} href={typeof href === "string" ? contentUrl(href) : href} /> }}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSitePaths,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
              [
                rehypePrettyCode,
                {
                  theme: "github-dark-dimmed",
                  keepBackground: true,
                },
              ],
            ],
          },
        }}
      />
    </div>
  );
}
