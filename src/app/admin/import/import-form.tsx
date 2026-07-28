"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createArticle } from "@/server-actions/articles";
import matter from "gray-matter";

export function ImportForm() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFile(file: File) {
    setImporting(true);
    setMessage("");
    try {
      const raw = await file.text();
      const { data, content } = matter(raw);

      const title = data.title ?? file.name.replace(/\.md$/, "");
      const slug =
        data.slug ??
        title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const tags = data.tags
        ? Array.isArray(data.tags)
          ? data.tags
          : [data.tags]
        : [];
      const excerpt =
        data.excerpt ??
        content.slice(0, 200).replace(/\n/g, " ").trim() + "...";
      const coverImage = data.coverImage ?? data.cover_image ?? "";
      const status = data.status === "published" ? "published" : "draft";

      await createArticle({
        title,
        slug,
        content,
        excerpt,
        coverImage,
        tags,
        status: status as "draft" | "published",
      });

      setMessage(`${t("importSuccess")}: "${title}"`);
      router.refresh();
    } catch (e) {
      setMessage(`${t("importFailed")}: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file?.name.endsWith(".md")) handleFile(file);
        }}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-border-hover"
        }`}
      >
        <p className="font-ui text-text-secondary text-sm mb-3">
          {importing ? t("importing") : t("dragDrop")}
        </p>
        <label className="cursor-pointer inline-block px-4 py-2 font-ui text-xs bg-bg-elevated border border-border rounded-md hover:border-accent transition-colors">
          {t("chooseFile")}
          <input
            type="file"
            accept=".md,.mdx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>

      {message && (
        <p className="mt-4 font-ui text-sm text-text-secondary">{message}</p>
      )}

      <div className="mt-8 p-4 bg-bg-surface rounded-lg border border-border">
        <h3 className="font-ui text-sm font-semibold mb-2">{t("expectedFormat")}</h3>
        <pre className="font-mono text-xs text-text-secondary bg-bg-muted p-3 rounded overflow-x-auto">
{`---
title: "My Post Title"
tags: [rust, tutorial]
excerpt: "Short summary"
status: draft
coverImage: "https://..."
---`}
        </pre>
      </div>
    </div>
  );
}
