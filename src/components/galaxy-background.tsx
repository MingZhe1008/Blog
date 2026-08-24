"use client";

import { usePathname } from "next/navigation";

export function GalaxyBackground() {
  const pathname = usePathname();
  const isArticleDetail = pathname.startsWith("/blog/");

  return (
    <div
      className={`galaxy-background${isArticleDetail ? " galaxy-background--static" : ""}`}
      aria-hidden="true"
    >
      <div className="galaxy-nebula galaxy-nebula--cyan" />
      <div className="galaxy-nebula galaxy-nebula--violet" />
      <div className="galaxy-star-stream galaxy-star-stream--far" />
      <div className="galaxy-star-stream galaxy-star-stream--near" />
      <div className="galaxy-noise" />
    </div>
  );
}
