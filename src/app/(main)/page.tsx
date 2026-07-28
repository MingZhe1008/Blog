import { getPublishedArticles } from "@/lib/data";
import { HomeView } from "./home-view";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { articles } = await getPublishedArticles({ limit: 5 });
  return <HomeView articles={articles} />;
}
