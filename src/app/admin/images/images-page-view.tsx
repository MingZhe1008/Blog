"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deleteUploadedImage, type UploadedImage } from "@/server-actions/upload";
import { CopyIcon, Trash2Icon, ExternalLinkIcon, ImageIcon } from "lucide-react";

interface Props {
  images: UploadedImage[];
}

export function ImagesPageView({ images }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [copiedName, setCopiedName] = useState<string | null>(null);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }

  async function handleDelete(name: string) {
    if (!confirm(t("confirmDeleteImage"))) return;
    await deleteUploadedImage(name);
    router.refresh();
  }

  async function handleCopy(url: string, name: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 1500);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 1500);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-display text-2xl font-black">{t("images")}</h1>
        <span className="font-ui text-xs text-text-muted bg-bg-surface border border-border px-2 py-0.5 rounded-full">
          {t("imageCount", { count: images.length })}
        </span>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon size={48} className="text-text-muted mb-4" />
          <p className="font-ui text-text-muted text-sm">{t("noImages")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.name}
              className="bg-bg-surface border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-colors"
            >
              {/* 缩略图 */}
              <a href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="aspect-video bg-bg-elevated flex items-center justify-center">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </a>

              {/* 信息区 */}
              <div className="p-3 space-y-2">
                <p className="font-mono text-xs text-text-primary truncate" title={img.name}>
                  {img.name}
                </p>
                <div className="flex items-center gap-3 font-ui text-[10px] text-text-muted">
                  <span>{formatSize(img.size)}</span>
                  <span>{formatDate(img.lastModified)}</span>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-1 pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => handleCopy(img.url, img.name)}
                    className="inline-flex items-center gap-1 px-2 py-1 font-ui text-[11px] rounded
                               hover:bg-bg-elevated transition-colors"
                    title={t("copyUrl")}
                  >
                    <CopyIcon size={12} />
                    {copiedName === img.name ? t("copied") : t("copyUrl")}
                  </button>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 font-ui text-[11px] rounded
                               hover:bg-bg-elevated transition-colors"
                    title={t("viewImage")}
                  >
                    <ExternalLinkIcon size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.name)}
                    className="inline-flex items-center gap-1 px-2 py-1 font-ui text-[11px] rounded
                               text-red-400 hover:bg-red-950/30 transition-colors ml-auto"
                  >
                    <Trash2Icon size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
