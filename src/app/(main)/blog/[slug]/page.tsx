import { getArticleBySlug, getAdjacentArticles } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXContent } from "@/components/mdx-renderer";
import { PostView } from "./post-view";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      tags: article.tags ?? [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") notFound();

  const { prev, next } = await getAdjacentArticles(slug);

  return (
    <PostView article={article} prev={prev} next={next}>
      <MDXContent source={article.content} />
    </PostView>
  );
}
