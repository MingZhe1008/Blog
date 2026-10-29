"use server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { persistProject, removeProject } from "@/lib/projects";
export async function saveProject(input: Parameters<typeof persistProject>[0]) {
  if (!await isAdminAuthenticated()) return { error: "登录已失效，请重新登录管理台。" };
  try { await persistProject(input); revalidatePath("/projects"); revalidatePath("/admin/projects"); return { success: true }; }
  catch { return { error: "保存失败，请检查标题、简介和链接。" }; }
}
export async function deleteProject(id: number) {
  if (!await isAdminAuthenticated()) return { error: "登录已失效，请重新登录管理台。" };
  try { await removeProject(id); revalidatePath("/projects"); revalidatePath("/admin/projects"); return { success: true }; }
  catch { return { error: "删除失败，请重试。" }; }
}
