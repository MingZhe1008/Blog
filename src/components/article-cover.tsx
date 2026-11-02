"use client";
import { sitePath } from "@/lib/site-paths";
import { useState } from "react";
export function ArticleCover({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <div className="journal-card__cover"><img src={sitePath(src)} alt="" loading="lazy" onError={() => setFailed(true)} /></div>;
}
