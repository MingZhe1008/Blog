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
      repoId="R_kgDOTlgJYQ"
      category="Announcements"
      categoryId="DIC_kwDOTlgJYc4DCM1N"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      lang="zh-CN"
      loading="lazy"
    />
  );
}
