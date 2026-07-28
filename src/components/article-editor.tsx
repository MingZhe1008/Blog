"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle, type Article } from "@/server-actions/articles";

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

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[\s/\\]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "untitled";
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
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full bg-bg-surface border border-border rounded-md px-3 py-1.5 font-mono text-sm
                       focus:outline-none focus:border-accent transition-colors"
            placeholder={t("placeholder_coverImage")}
          />
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
        <label className="block font-ui text-text-secondary text-xs mb-1 uppercase tracking-wider">
          {t("label_content")}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={24}
          className="w-full bg-bg-surface border border-border rounded-md px-4 py-3 font-mono text-sm leading-relaxed
                     focus:outline-none focus:border-accent transition-colors resize-y"
          placeholder={t("placeholder_content")}
        />
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
