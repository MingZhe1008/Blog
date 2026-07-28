"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function GiscusComments() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-40 bg-bg-muted rounded-lg animate-pulse" />;

  return (
    <Giscus
      repo="MingZhe1008/Blog"
      repoId="R_kgxxxxx"
      category="Announcements"
      categoryId="DIC_kwxxxxx"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      lang="en"
      loading="lazy"
    />
  );
}
