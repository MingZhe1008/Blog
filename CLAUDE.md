# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run start        # Production server
```

Windows scripts: `scripts/dev.bat`, `scripts/build.bat`, `scripts/start.bat`

## Architecture

Next.js 15 App Router, TypeScript, SQLite (sql.js WASM), Drizzle ORM.

### Data Flow (3 layers)

```
src/lib/db.ts              — SQL.js connection, WASM init, auto-creates tables, saveDb() writes to disk
src/lib/data.ts            — Query functions (getPublishedArticles, getArticleBySlug…) + raw DB mutations (insertArticle, deleteArticleById…)
src/server-actions/articles.ts  — "use server" actions: wrap data.ts mutations + revalidatePath()
```

**Every DB page must have `export const dynamic = "force-dynamic"`** because sql.js WASM can't run during static generation.

**DB file**: `data/blog.db` (gitignored). Back it up separately.

### Route Structure

```
src/app/layout.tsx                      — Root: fonts, I18nProvider, ThemeProvider
├── (main)/layout.tsx                   — Public layout: Header (nav + locale switcher + theme toggle)
│   ├── page.tsx                        — Home (server: fetches articles → HomeView client component)
│   └── blog/
│       ├── page.tsx                    — Blog list (server → BlogListView client)
│       └── [slug]/page.tsx             — Post detail (server → PostView client + Giscus)
└── admin/layout.tsx                    — Admin layout: sidebar (client, uses useTranslations)
    ├── page.tsx                        — Article table (server → AdminPageView client)
    ├── editor/page.tsx                 — New post (client: ArticleEditor)
    ├── editor/[id]/page.tsx            — Edit post (server fetcher + ArticleEditor)
    └── import/page.tsx                 — MD import (client: ImportForm)
```

### i18n

Client-side via `src/components/i18n-provider.tsx`. Inline messages (zh/en) in one file. Root layout reads `NEXT_LOCALE` cookie via `cookies()` and passes `initialLocale` to the I18nProvider so SSR matches client. `LocaleSwitcher` sets cookie + router.refresh().

Server components that need data: fetch in server wrapper → pass to client "View" component that uses `useTranslations`.

### Auth

Middleware (`src/middleware.ts`) adds HTTP Basic Auth to all `/admin/*` routes. Password from `ADMIN_PASSWORD` env var (default: `admin123`).

### Design: Warm Terminal

Custom CSS tokens in `src/app/globals.css` via Tailwind v4 `@theme`. Warm amber accent on dark brown backgrounds. Fonts: Playfair Display (headings), Crimson Pro (body), JetBrains Mono (code), DM Sans (UI). CSS class `.light` overrides colors for light mode. `next-themes` handles toggle.

### Key Conventions

- **Article format**: MDX. Frontmatter parsed by `gray-matter`.
- **Tags**: Stored as JSON string array in SQLite, filtered in JS (not SQL).
- **Image storage**: Local `public/uploads/` (abstract interface planned for OSS migration).
- **Comments**: Giscus component (`src/components/giscus.tsx`) — requires GitHub repoId/categoryId config before use.
- **MDX rendering**: `next-mdx-remote/rsc` with rehype-pretty-code (theme: github-dark-dimmed), rehype-slug, remark-gfm.
- **Config**: `next.config.ts`, `postcss.config.mjs`, Tailwind v4 (CSS-based, no `tailwind.config.ts`).
