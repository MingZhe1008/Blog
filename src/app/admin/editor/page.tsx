import { AdminPageHeading } from "@/components/admin-page-heading";
import { ArticleEditor } from "@/components/article-editor";

export default function NewPostPage() {
  return (
    <div>
      <AdminPageHeading message="newPost" />
      <ArticleEditor />
    </div>
  );
}
