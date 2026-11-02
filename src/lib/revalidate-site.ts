import { revalidatePath } from "next/cache";
import { sitePath } from "./site-paths";

export function revalidateSitePath(path: string, type?: "page" | "layout") {
  // Layout tags are app-relative; URL-specific tags include the public mount path.
  revalidatePath(path, type);
  revalidatePath(sitePath(path), type);
}
