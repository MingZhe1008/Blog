import { getPublishedArticles, getAllTags } from "@/lib/data";
import { BlogListView } from "./blog-list-view";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const activeTag = sp.tag ?? undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const { articles, totalPages } = await getPublishedArticles({
    tags: activeTag ? [activeTag] : undefined,
    page,
    limit: 10,
    query: sp.q,
  });
  const tags = await getAllTags();

  return (
    <BlogListView
      articles={articles}
      tags={tags}
      activeTag={activeTag}
      page={page}
      totalPages={totalPages}
      query={sp.q ?? ""}
    />
  );
}
