"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TagFilter({
  tags,
  activeTag,
  allLabel,
  ariaLabel,
}: {
  tags: string[];
  activeTag?: string;
  allLabel?: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTag(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (tag) params.set("tag", tag);
    else params.delete("tag");
    router.push("/blog" + (params.size ? "?" + params.toString() : ""));
  }

  if (tags.length === 0) return null;

  return (
    <div
      className="mb-10 flex flex-wrap gap-2"
      role="group"
      aria-label={ariaLabel ?? "Tag filter"}
    >
      <button
        onClick={() => setTag(null)}
        aria-pressed={!activeTag}
        className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          !activeTag
            ? "border-accent/60 bg-accent/10 text-accent shadow-[0_0_16px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
            : "border-border/70 text-text-muted hover:border-accent/40 hover:text-text-primary"
        }`}
      >
        <span aria-hidden="true">✦ </span>{allLabel ?? "All"}
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => setTag(tag)}
          aria-pressed={activeTag === tag}
          className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            activeTag === tag
              ? "border-accent/60 bg-accent/10 text-accent shadow-[0_0_16px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
              : "border-border/70 text-text-muted hover:border-accent/40 hover:text-text-primary"
          }`}
        >
          <span aria-hidden="true">· </span>{tag}
        </button>
      ))}
    </div>
  );
}
