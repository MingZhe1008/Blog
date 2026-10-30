import { AdminPageHeading } from "@/components/admin-page-heading";
import { ArticleEditor } from "@/components/article-editor";
import { getArticleById } from "@/lib/data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  if (!article) notFound();

  return (
    <div>
      <AdminPageHeading message="editPost" />
      <ArticleEditor article={article} />
    </div>
  );
}
