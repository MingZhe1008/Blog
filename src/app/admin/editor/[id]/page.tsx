import { ArticleEditor } from "@/components/article-editor";
import { getAllArticles } from "@/lib/data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articles = await getAllArticles();
  const article = articles.find((a) => a.id === parseInt(id));
  if (!article) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-black mb-8">Edit Post</h1>
      <ArticleEditor article={article} />
    </div>
  );
}
