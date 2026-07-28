import { getAllArticles } from "@/lib/data";
import { AdminPageView } from "./admin-page-view";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const articles = await getAllArticles();
  return <AdminPageView articles={articles} />;
}
