import { getReadingExcerpts } from "@/lib/reading-excerpts";
import { ExcerptsManager } from "@/components/excerpts-manager";
export const dynamic = "force-dynamic";
export default async function ExcerptsPage() {
  return <ExcerptsManager excerpts={await getReadingExcerpts(false)} />;
}
