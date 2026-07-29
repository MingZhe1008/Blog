"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadedImage {
  name: string;
  url: string;
  size: number;
  lastModified: string;
}

export async function uploadImageFile(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  try {
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return { error: "未找到文件" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: `不支持的文件类型: ${file.type}。仅支持 JPG、PNG、GIF、WebP、SVG` };
    }

    if (file.size > MAX_SIZE) {
      return { error: `文件过大 (${(file.size / 1024 / 1024).toFixed(1)}MB)，最大 10MB` };
    }

    // 确保上传目录存在
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // 生成唯一文件名
    const ext = path.extname(file.name) || ".jpg";
    const randomHex = crypto.randomBytes(4).toString("hex");
    const uniqueName = `${Date.now()}-${randomHex}${ext}`;

    // 写入文件
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, uniqueName), buffer);

    return { url: `/uploads/${uniqueName}` };
  } catch (e) {
    console.error("Upload failed:", e);
    return { error: "上传失败，请稍后重试" };
  }
}

export async function listUploadedImages(): Promise<UploadedImage[]> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });

    const images = await Promise.all(
      entries
        .filter((e) => {
          if (!e.isFile()) return false;
          const ext = path.extname(e.name).toLowerCase();
          return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);
        })
        .map(async (e) => {
          const filePath = path.join(UPLOAD_DIR, e.name);
          const stat = await fs.stat(filePath);
          return {
            name: e.name,
            url: `/uploads/${e.name}`,
            size: stat.size,
            lastModified: stat.mtime.toISOString(),
          };
        })
    );

    // 按修改时间降序排列
    images.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    return images;
  } catch {
    return [];
  }
}

export async function deleteUploadedImage(filename: string): Promise<{ success: true } | { error: string }> {
  // 路径穿越防护
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return { error: "无效的文件名" };
  }

  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.unlink(filePath);
    revalidatePath("/admin/images");
    return { success: true };
  } catch {
    return { error: "删除失败，文件可能不存在" };
  }
}
