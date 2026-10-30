"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getImageLibrary, storeImage, retainImage, removeImages, type UploadedImage } from "@/lib/image-library";

const EXTENSIONS: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp", "image/svg+xml": ".svg" };
const unauthorized = "登录已失效，请重新登录管理台。 / Please sign in again.";

export async function uploadImageFile(formData: FormData): Promise<{ url: string; reused: boolean } | { error: string }> {
  if (!await isAdminAuthenticated()) return { error: unauthorized };
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size) return { error: "未找到图片文件 / Image file missing" };
    const ext = EXTENSIONS[file.type];
    if (!ext) return { error: "仅支持 JPG、PNG、GIF、WebP、SVG / Unsupported image format" };
    if (file.size > 10 * 1024 * 1024) return { error: "图片最大 10MB / Maximum image size: 10MB" };
    const result = await storeImage(Buffer.from(await file.arrayBuffer()), ext);
    revalidatePath("/admin/images");
    return result;
  } catch (error) {
    console.error("Image upload failed:", error);
    return { error: "上传失败，请重试。 / Upload failed. Please try again." };
  }
}

export async function listUploadedImages(): Promise<UploadedImage[]> {
  if (!await isAdminAuthenticated()) return [];
  return getImageLibrary();
}

export async function retainUploadedImage(name: string) {
  if (!await isAdminAuthenticated()) return { error: unauthorized };
  try { await retainImage(name); revalidatePath("/admin/images"); return { success: true }; }
  catch { return { error: "图片不存在或续期失败 / Image unavailable" }; }
}

export async function deleteUploadedImage(name: string): Promise<{ success: true } | { error: string }> {
  if (!await isAdminAuthenticated()) return { error: unauthorized };
  try {
    const result = await removeImages([name], false);
    revalidatePath("/admin/images");
    if (!result.deleted.length) return { error: "图片正在使用或已不存在，未删除。 / Image is in use or no longer exists." };
    return { success: true };
  } catch { return { error: "删除失败，请重试。 / Delete failed. Please try again." }; }
}

export async function cleanupUnusedImages(names: string[]) {
  if (!await isAdminAuthenticated()) return { error: unauthorized };
  try {
    const result = await removeImages(names, true);
    revalidatePath("/admin/images"); return result;
  } catch { return { error: "清理失败，请刷新后重试。 / Cleanup failed. Please refresh and retry." }; }
}
