"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type SearchResult = { type: "article" | "note"; title: string; description: string; href: string };

function SearchIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg>;
}

export function GlobalSearch() {
  const t = useTranslations("search");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLocaleLowerCase() === "f") {
        event.preventDefault(); setOpen(true);
      } else if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("search-is-open");
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => document.body.classList.remove("search-is-open");
  }, [open]);
  useEffect(() => {
    const value = query.trim();
    if (!value) { setResults([]); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`, { signal: controller.signal });
        const data = await response.json();
        setResults(data.results ?? []); setActive(0);
      } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setResults([]); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 120);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);
  const choose = (result: SearchResult) => { setOpen(false); setQuery(""); router.push(result.href); };

  return <>
    <button type="button" className="search-trigger" onClick={() => setOpen(true)} aria-label={t("open")}>
      <SearchIcon /><span>{t("placeholder")}</span><kbd>Ctrl F</kbd>
    </button>
    {open && <div className="search-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-label={t("open")}>
        <div className="search-dialog__input">
          <SearchIcon />
          <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder={t("placeholder")} aria-label={t("placeholder")}
            onKeyDown={event => {
              if (event.key === "ArrowDown") { event.preventDefault(); setActive(value => Math.min(value + 1, results.length - 1)); }
              if (event.key === "ArrowUp") { event.preventDefault(); setActive(value => Math.max(value - 1, 0)); }
              if (event.key === "Enter" && results[active]) { event.preventDefault(); choose(results[active]); }
            }} />
          <button type="button" className="search-dialog__esc" onClick={() => setOpen(false)}>ESC</button>
        </div>
        <div className="search-results" aria-live="polite">
          {!query.trim() && <p className="search-status">{t("prompt")}</p>}
          {query.trim() && loading && <p className="search-status">{t("loading")}</p>}
          {query.trim() && !loading && !results.length && <p className="search-status">{t("empty")}</p>}
          {results.map((result, index) => <button type="button" key={`${result.type}-${result.href}`} className={index === active ? "is-active" : ""} onMouseEnter={() => setActive(index)} onClick={() => choose(result)}>
            <span><strong>{result.title}</strong><small>{result.description}</small></span>
            <em>{result.type === "article" ? t("article") : t("note")}</em>
          </button>)}
        </div>
      </section>
    </div>}
  </>;
}
