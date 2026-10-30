"use server";
import { withImageContentWrite } from "@/lib/image-library";
import { revalidatePath } from "next/cache";
import { persistNote } from "@/lib/notes";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function saveNote(input: Parameters<typeof persistNote>[0]) {
  // Server actions can be invoked independently of the page that displays them.
  if (!await isAdminAuthenticated()) {
    return { error: "unauthorized" } as const;
  }
  try {
    const id = await withImageContentWrite(() => persistNote(input));
    revalidatePath("/admin/images");
    revalidatePath("/notes", "layout");
    revalidatePath("/admin/notes", "layout");
    return { id } as const;
  } catch {
    return { error: "saveFailed" } as const;
  }
}
