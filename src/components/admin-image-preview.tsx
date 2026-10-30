"use client";

import { useRef, useState } from "react";
import { Expand, ImageOff, X } from "lucide-react";
import { useLocale } from "next-intl";

/** Shared, keyboard-accessible image viewer. The URL is never used as preview text. */
export function AdminImagePreview({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const en = useLocale() === "en";
  const failed = failedSrc === src;
  return <>
    <button type="button" className={`admin-image-preview ${className}`} onClick={() => dialog.current?.showModal()} aria-label={en ? `Preview ${alt}` : `预览${alt}`}>
      {failed ? <span className="admin-image-error"><ImageOff size={24} />{en ? "Image unavailable · click to retry" : "图片加载失败 · 点击重试"}</span> : <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />}
      <span className="admin-image-expand"><Expand size={14} />{en ? "Preview" : "放大预览"}</span>
    </button>
    <dialog ref={dialog} className="admin-image-dialog" aria-label={en ? "Image preview" : "图片预览"} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="admin-image-dialog-bar"><span>{alt}</span><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label={en ? "Close preview" : "关闭预览"}><X size={22} /></button></div>
      <img src={src} alt={alt} onLoad={() => setFailedSrc(null)} />
    </dialog>
  </>;
}
