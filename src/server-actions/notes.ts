"use server";
import { withImageContentWrite } from "@/lib/image-library";
import { revalidateSitePath as revalidatePath } from "@/lib/revalidate-site";
import { persistNote, moveNotePath, moveNoteFolder, changeNoteTree, type NoteTreeChange, type NoteSummary } from "@/lib/notes";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function manageNoteTree(target: NoteTreeChange, operation: "rename" | "delete", name: string, expected: NoteSummary[]) {
  if (!await isAdminAuthenticated()) return {error:"unauthorized"} as const;
  try {
    await withImageContentWrite(() => changeNoteTree(target,operation,name,expected));
    revalidatePath("/notes", "layout");
    revalidatePath("/admin/notes", "layout");
    revalidatePath("/admin/images");
    return {success:true} as const;
  } catch { return {error:"operationFailed"} as const; }
}

export async function moveNote(id: number, path: string[], expectedPath: string[]) {
  if (!await isAdminAuthenticated()) return { error: "unauthorized" } as const;
  try {
    await withImageContentWrite(() => moveNotePath(id, path, expectedPath));
    revalidatePath("/notes", "layout");
    revalidatePath("/admin/notes", "layout");
    return { success: true } as const;
  } catch { return { error: "moveFailed" } as const; }
}
export async function moveFolder(source: string[], parent: string[], expected: {id:number;path:string[]}[]) {
  if (!await isAdminAuthenticated()) return {error:"unauthorized"} as const;
  try {
    await withImageContentWrite(() => moveNoteFolder(source,parent,expected));
    revalidatePath("/notes", "layout");
    revalidatePath("/admin/notes", "layout");
    return {success:true} as const;
  } catch { return {error:"moveFailed"} as const; }
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
