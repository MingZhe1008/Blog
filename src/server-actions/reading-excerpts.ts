"use server";
import { revalidatePath } from "next/cache";
import { persistReadingExcerpt, type ExcerptInput } from "@/lib/reading-excerpts";
import { isAdminAuthenticated } from "@/lib/admin-auth";
export async function saveReadingExcerpt(input: ExcerptInput) {
  if (!await isAdminAuthenticated()) return { error: "unauthorized" } as const;
  try {
    const id = await persistReadingExcerpt(input);
    revalidatePath("/"); revalidatePath("/admin/excerpts");
    return { id } as const;
  } catch { return { error: "saveFailed" } as const; }
}
