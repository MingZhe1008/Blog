"use client";

import { AdminImagePreview } from "@/components/admin-image-preview";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cleanupUnusedImages, deleteUploadedImage, retainUploadedImage } from "@/server-actions/upload";
import type { UploadedImage } from "@/lib/image-library";
import { CopyIcon, Trash2Icon, ImageIcon, RefreshCw, ShieldCheck, Clock3, Check } from "lucide-react";

type Filter = "all" | UploadedImage["status"];
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagesPageView({ images }: { images: UploadedImage[] }) {
  const t = useTranslations("admin");
  const en = useLocale() === "en";
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const labels = {
    all: en ? "All images" : "全部图片", used: en ? "In use" : "已引用",
    temporary: en ? "Temporary" : "临时未引用", unused: en ? "Ready to clean" : "可清理",
  };
  const date = (value: string) => new Date(value).toLocaleString(en ? "en-US" : "zh-CN");
  const visible = images.filter(image => filter === "all" || image.status === filter);
  const eligible = images.filter(image => image.status === "unused");
  const selectedEligible = eligible.filter(image => selected.includes(image.name));
  const visibleEligible = visible.filter(image => image.status === "unused");

  async function handleDelete(image: UploadedImage) {
    if (busy || image.status === "used") return;
    const prompt = image.status === "temporary"
      ? (en ? "This image may be in an unsaved editor. Delete it anyway?" : "这张图片仍在临时保留期内，可能正用于未保存的编辑。确定删除吗？")
      : t("confirmDeleteImage");
    if (!confirm(prompt)) return;
    setBusy(image.name); setError(""); setMessage("");
    try {
      const result = await deleteUploadedImage(image.name);
      if ("error" in result) setError(result.error);
      else { setSelected(current => current.filter(name => name !== image.name)); setMessage(en ? "Image deleted." : "已删除图片。"); }
    } catch { setError(en ? "Delete failed. Please retry." : "删除失败，请重试。"); }
    finally { setBusy(null); }
  }

  async function cleanup(candidates: UploadedImage[]) {
    if (busy || !candidates.length) return;
    const batch = candidates.slice(0, 200);
    if (!confirm(en ? `Permanently delete ${batch.length} expired, unreferenced images (${formatSize(batch.reduce((sum, image) => sum + image.size, 0))})? Usage will be checked again before deletion.` : `确定永久清理 ${batch.length} 张已过保留期且未引用的图片（${formatSize(batch.reduce((sum, image) => sum + image.size, 0))}）？删除前会再次检查使用状态。`)) return;
    setBusy("cleanup"); setError(""); setMessage("");
    try {
      const result = await cleanupUnusedImages(batch.map(image => image.name));
      if ("error" in result) setError(result.error);
      else {
        setSelected(current => current.filter(name => !result.deleted.includes(name)));
        setMessage(en ? `Deleted ${result.deleted.length}; skipped ${result.skipped.length}.` : `已清理 ${result.deleted.length} 张，跳过 ${result.skipped.length} 张。`);
      }
    } catch { setError(en ? "Cleanup failed. Please retry." : "清理失败，请重试。"); }
    finally { setBusy(null); }
  }

  async function handleCopy(image: UploadedImage) {
    if (busy) return;
    setBusy(image.name); setError("");
    try {
      const result = await retainUploadedImage(image.name);
      if (result.error) { setError(result.error); return; }
      try { await navigator.clipboard.writeText(image.url); }
      catch {
        const input = document.createElement("textarea"); input.value = image.url;
        input.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(input); input.select();
        const copied = document.execCommand("copy"); input.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      setCopiedName(image.name); setTimeout(() => setCopiedName(null), 1800);
    } catch { setError(en ? "Copy failed. Please check clipboard permissions." : "复制失败，请检查剪贴板权限。"); }
    finally { setBusy(null); }
  }

  return <div className="admin-media-library">
    <div className="admin-media-heading"><div><h1>{t("images")}</h1><p>{images.length} {en ? "images" : "张图片"} · {formatSize(images.reduce((sum, image) => sum + image.size, 0))}</p></div>
      <button type="button" className="admin-media-button" disabled={!!busy || refreshing} onClick={() => startRefresh(() => router.refresh())}><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />{en ? "Refresh status" : "刷新状态"}</button>
    </div>
    <p className="admin-media-help">{en ? "Drafts, published content and projects protect their images. Unreferenced uploads are kept for 7 days. Uploading again or copying renews that period; cleanup requires your confirmation." : "草稿、已发布内容和项目引用的图片均受保护。未引用图片保留 7 天，重新上传或复制会续期；过期后由你确认清理。"}</p>
    <div className="admin-media-toolbar">
      <div className="admin-media-filters" role="group" aria-label={en ? "Filter images" : "图片状态筛选"}>{(["all", "used", "temporary", "unused"] as Filter[]).map(key => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{labels[key]}<span>{key === "all" ? images.length : images.filter(image => image.status === key).length}</span></button>)}</div>
      <button type="button" className="admin-media-button" disabled={!!busy || !eligible.length} onClick={() => void cleanup(eligible)}><Trash2Icon size={14} />{busy === "cleanup" ? (en ? "Cleaning…" : "清理中…") : (en ? "Clean expired images" : "清理过期图片")}</button>
    </div>
    {!!eligible.length && <div className="admin-media-selection"><label><input type="checkbox" checked={!!visibleEligible.length && visibleEligible.every(image => selected.includes(image.name))} disabled={!!busy || !visibleEligible.length} onChange={event => {
      const names = visibleEligible.map(image => image.name); setSelected(current => event.target.checked ? [...new Set([...current, ...names])] : current.filter(name => !names.includes(name)));
    }} />{en ? "Select cleanable images on this view" : "选择当前可清理图片"}</label><button type="button" disabled={!!busy || !selectedEligible.length} onClick={() => void cleanup(selectedEligible)}>{en ? `Clean selected (${selectedEligible.length})` : `清理所选（${selectedEligible.length}）`}</button><span>{en ? "Up to 200 per operation" : "每次最多清理 200 张"}</span></div>}
    {error && <p role="alert">{error}</p>}{message && <p role="status" className="admin-feedback">{message}</p>}
    {!visible.length ? <div className="admin-media-empty"><ImageIcon size={36} /><p>{images.length ? (en ? "No images with this status." : "当前状态下暂无图片。") : t("noImages")}</p></div> : <div className="admin-media-grid">{visible.map(image => <article key={image.name} className="admin-media-card" data-image-name={image.name}>
      <AdminImagePreview src={image.url} alt={image.name} />
      <div className="admin-media-card-body">
        <div className="admin-media-status-row"><span className={`admin-media-status is-${image.status}`}>{image.status === "used" ? <ShieldCheck size={13} /> : image.status === "temporary" ? <Clock3 size={13} /> : <Check size={13} />}{labels[image.status]}</span>{image.status === "unused" && <label className="admin-media-checkbox"><input type="checkbox" aria-label={en ? `Select ${image.name}` : `选择${image.name}`} checked={selected.includes(image.name)} disabled={!!busy} onChange={event => setSelected(current => event.target.checked ? [...current, image.name] : current.filter(name => name !== image.name))} /></label>}</div>
        <p className="admin-media-filename" title={image.name}>{image.name}</p>
        <p className="admin-media-meta">{formatSize(image.size)} · {date(image.lastModified)}</p>
        {image.references.length ? <details className="admin-media-references"><summary>{en ? `Used by ${image.references.length} items` : `${image.references.length} 处引用 · 查看来源`}</summary><ul>{image.references.map(reference => <li key={reference.kind + reference.href}><span>{reference.kind === "article" ? (en ? "Article" : "文章") : reference.kind === "note" ? (en ? "Note" : "笔记") : (en ? "Project" : "项目")} · {reference.status === "published" ? t("published") : t("draft")}</span><Link href={reference.href}>{reference.title}</Link></li>)}</ul></details> : <p className="admin-media-expiry">{image.status === "temporary" ? (en ? `Kept until ${date(image.cleanupAfter!)}` : `保留至 ${date(image.cleanupAfter!)}`) : (en ? "Retention expired · ready to clean" : "保留期已过，可安全清理")}</p>}
        <div className="admin-media-card-actions"><button type="button" disabled={!!busy} onClick={() => void handleCopy(image)}><CopyIcon size={13} />{copiedName === image.name ? t("copied") : t("copyUrl")}</button><button type="button" disabled={!!busy || image.status === "used"} onClick={() => void handleDelete(image)} aria-label={t("delete")} title={image.status === "used" ? (en ? "Remove references before deleting" : "请先移除内容中的引用") : t("delete")}><Trash2Icon size={14} />{image.status === "used" ? (en ? "Protected" : "受保护") : busy === image.name ? "…" : t("delete")}</button></div>
      </div>
    </article>)}</div>}
  </div>;
}
