"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { readingExcerpts } from "@/lib/reading-excerpts";

export function ReadingExcerpt() {
  const t = useTranslations("home");
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(Math.floor(Math.random() * readingExcerpts.length)); }, []);
  const excerpt = readingExcerpts[index];
  if (!excerpt) return null;
  const next = () => setIndex(current => (current + 1 + Math.floor(Math.random() * (readingExcerpts.length - 1))) % readingExcerpts.length);
  return <section className="reading-excerpt" aria-label={t("excerptLabel")}>
    <span className="reading-excerpt__label">{t("excerptLabel")}</span>
    <figure aria-live="polite" aria-atomic="true">
      <p>“{excerpt.text}”</p><figcaption>— {excerpt.source}</figcaption>
    </figure>
    {readingExcerpts.length > 1 && <button type="button" onClick={next}>{t("nextExcerpt")} <span aria-hidden="true">↻</span></button>}
  </section>;
}
