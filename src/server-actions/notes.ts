"use server";
import { withImageContentWrite } from "@/lib/image-library";
import { revalidateSitePath as revalidatePath } from "@/lib/revalidate-site";
import { persistNote, moveNotePath } from "@/lib/notes";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function moveNote(id: number, path: string[], expectedPath: string[]) {
  if (!await isAdminAuthenticated()) return { error: "unauthorized" } as const;
  try {
    await withImageContentWrite(() => moveNotePath(id, path, expectedPath));
    revalidatePath("/notes", "layout");
    revalidatePath("/admin/notes", "layout");
    return { success: true } as const;
  } catch { return { error: "moveFailed" } as const; }
}

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
