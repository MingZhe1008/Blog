"use client";
import { useState } from "react";
export function ArticleCover({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <div className="journal-card__cover"><img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /></div>;
}
