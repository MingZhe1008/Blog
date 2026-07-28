"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TagFilter({
  tags,
  activeTag,
  allLabel,
}: {
  tags: string[];
  activeTag?: string;
  allLabel?: string;
}) {
  const router = useRouter();

  function setTag(tag: string | null) {
    if (tag) {
      router.push(`/blog?tag=${encodeURIComponent(tag)}`);
    } else {
      router.push("/blog");
    }
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => setTag(null)}
        className={`font-ui text-xs px-3 py-1 rounded-full border transition-colors ${
          !activeTag
            ? "border-accent text-accent bg-accent/10"
            : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
        }`}
      >
        {allLabel ?? "All"}
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => setTag(tag)}
          className={`font-ui text-xs px-3 py-1 rounded-full border transition-colors ${
            activeTag === tag
              ? "border-accent text-accent bg-accent/10"
              : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
