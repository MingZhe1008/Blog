"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle } from "@/server-actions/articles";
import { ImageUploadButton } from "@/components/image-upload-button";
import { uploadImageFile } from "@/server-actions/upload";
import { renderMarkdown } from "@/server-actions/preview";
import type { Article } from "@/lib/data";

interface Props {
  article?: Article;
}

export function ArticleEditor({ article }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isEdit = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [coverDragOver, setCoverDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[\s/\\]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "untitled";
  }

  function insertImageAtCursor(url: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const md = `![image](${url})`;
    const newContent = before + md + after;
    setContent(newContent);
    // 在 React 重渲染后恢复光标到插入文本的末尾
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + md.length;
      ta.focus();
    });
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    // 查找剪切板中的图片数据
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImageFile(formData);

        if ("url" in result) {
          insertImageAtCursor(result.url);
        }
        return;
      }
    }
  }

  async function togglePreview() {
    if (!preview) {
      const html = await renderMarkdown(content);
      setPreviewHtml(html);
    }
    setPreview(!preview);
  }

  async function uploadCoverFromClipboardOrFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadImageFile(formData);
    if ("url" in result) {
      setCoverImage(result.url);
    }
  }

  async function handleCoverPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await uploadCoverFromClipboardOrFile(file);
        return;
      }
    }
  }

  function handleCoverDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setCoverDragOver(true);
    }
  }

  function handleCoverDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCoverDragOver(false);
  }

  async function handleCoverDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCoverDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await uploadCoverFromClipboardOrFile(file);
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!isEdit || !article.slug) {
      setSlug(autoSlug(val));
    }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  const handleSave = useCallback(
    async (s: "draft" | "published") => {
      if (!title.trim() || !content.trim()) return;
      setSaving(true);
      try {
        if (isEdit && article) {
          await updateArticle(article.id, {
            title,
            slug: slug || autoSlug(title),
            content,
            excerpt,
            coverImage,
            tags,
            status: s,
          });
          router.refresh();
        } else {
          await createArticle({
            title,
            slug: slug || autoSlug(title),
            content,
            excerpt,
            coverImage,
            tags,
            status: s,
          });
          router.push("/admin");
        }
      } catch (e) {
        console.error("Save failed:", e);
      } finally {
        setSaving(false);
      }
    },
    [title, slug, content, excerpt, coverImage, tags, isEdit, article, router]
  );

  return (
    <div className="max-w-4xl">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-ui text-text-secondary text-xs mb-1 uppercase tracking-wider">
            {t("label_title")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full bg-bg-surface border border-border rounded-md px-3 py-2 font-body text-lg
                       focus:outline-none focus:border-accent transition-colors"
            placeholder={t("placeholder_title")}
          />
        </div>
        <div>
          <label className="block font-ui text-text-secondary text-xs mb-1 uppercase tracking-wider">
            {t("label_slug")}
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-bg-surface border border-border rounded-md px-3 py-2 font-mono text-sm
                       focus:outline-none focus:border-accent transition-colors"
            placeholder={t("placeholder_slug")}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <label className="block font-ui text-text-secondary text-xs mb-1 uppercase tracking-wider">
            {t("label_tags")}
          </label>
          <div className="flex gap-1 flex-wrap mb-1">
            {tags.map((tag) => (
              <span
                key={tag}
                onClick={() => setTags(tags.filter((x) => x !== tag))}
                className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent
                           rounded-full text-xs font-ui hover:bg-red-900/30 hover:text-red-400 transition-colors"
              >
                {tag} ×
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 bg-bg-surface border border-border rounded-md px-3 py-1.5 font-mono text-sm
                         focus:outline-none focus:border-accent transition-colors"
              placeholder={t("placeholder_tag")}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-1.5 font-ui text-xs bg-bg-elevated border border-border rounded-md
                         hover:border-accent transition-colors"
            >
              {t("addTag")}
            </button>
          </div>
        </div>
        <div>
          <label className="block font-ui text-text-secondary text-xs mb-1 uppercase tracking-wider">
            {t("label_coverImage")}
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              onPaste={handleCoverPaste}
              className="flex-1 bg-bg-surface border border-border rounded-md px-3 py-1.5 font-mono text-sm
                         focus:outline-none focus:border-accent transition-colors"
              placeholder={t("placeholder_coverImage")}
            />
            <ImageUploadButton onUploaded={(url) => setCoverImage(url)} />
          </div>
          <div
            onDragOver={handleCoverDragOver}
            onDragLeave={handleCoverDragLeave}
            onDrop={handleCoverDrop}
            className={`relative rounded-md border-2 border-dashed transition-all min-h-[2rem]
              ${coverDragOver
                ? "border-accent bg-accent/5"
                : coverImage
                  ? "border-transparent"
                  : "border-border bg-bg-surface/50"
              }`}
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt="封面预览"
                className="h-32 w-full rounded-md object-cover bg-bg-surface"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="flex items-center justify-center h-24 text-text-muted font-ui text-xs">
                {coverDragOver ? "释放以上传封面图" : "拖拽图片到此处，或点击上方按钮上传"}
              </div>
            )}
            {coverDragOver && (
              <div className="absolute inset-0 rounded-md bg-accent/10 flex items-center justify-center">
                <span className="font-ui text-xs text-accent font-medium">释放以上传封面图</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block font-ui text-text-secondary text-xs mb-1 uppercase tracking-wider">
          {t("label_excerpt")}
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full bg-bg-surface border border-border rounded-md px-3 py-2 font-body text-sm
                     focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder={t("placeholder_excerpt")}
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <label className="block font-ui text-text-secondary text-xs uppercase tracking-wider">
              {t("label_content")}
            </label>
            <button
              type="button"
              onClick={togglePreview}
              className={`font-ui text-[11px] px-2 py-0.5 rounded border transition-colors
                ${preview
                  ? "bg-accent/20 text-accent border-accent/30"
                  : "bg-bg-elevated text-text-muted border-border hover:border-accent"
                }`}
            >
              {preview ? t("editMode") : t("previewMode")}
            </button>
          </div>
          {!preview && <ImageUploadButton onUploaded={insertImageAtCursor} />}
        </div>
        {preview ? (
          <div
            className="w-full min-h-[400px] bg-bg-surface border border-border rounded-md px-6 py-4
                       prose prose-sm max-w-none text-text-primary
                       prose-headings:font-display prose-headings:text-text-primary
                       prose-p:text-text-secondary prose-p:font-body prose-p:leading-relaxed
                       prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-text-primary prose-code:font-mono prose-code:text-sm
                       prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-border prose-pre:rounded-lg
                       prose-img:rounded-md prose-img:max-w-full
                       prose-li:text-text-secondary prose-li:font-body
                       prose-blockquote:border-l-accent prose-blockquote:text-text-muted
                       [&_pre_code]:bg-transparent [&_pre]:bg-[#22272e] [&_pre]:p-4 [&_pre]:rounded-lg
                       [&_pre_code]:text-[#adbac7] [&_.line]:text-[#adbac7]"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            rows={24}
            className="w-full bg-bg-surface border border-border rounded-md px-4 py-3 font-mono text-sm leading-relaxed
                       focus:outline-none focus:border-accent transition-colors resize-y"
            placeholder={t("placeholder_content")}
          />
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="px-5 py-2 font-ui text-sm bg-bg-elevated border border-border rounded-md
                     hover:border-accent transition-colors disabled:opacity-50"
        >
          {saving ? t("saveDrafting") : t("saveDraft")}
        </button>
        <button
          onClick={() => handleSave("published")}
          disabled={saving}
          className="px-5 py-2 font-ui text-sm bg-accent text-white rounded-md
                     hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? t("publishing") : t("publish")}
        </button>
        {isEdit && (
          <a
            href={`/blog/${article.slug}`}
            target="_blank"
            className="ml-auto font-ui text-xs text-text-muted hover:text-accent transition-colors"
          >
            {t("viewPost")}
          </a>
        )}
      </div>
    </div>
  );
}
