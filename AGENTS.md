# 项目开发指南

适用于本仓库的 Codex 和其他开发助手。最后更新：2026-10-30。

## 每次会话的阅读顺序

1. 阅读本文件，再阅读 `docs/STATUS.md`，了解最新功能、验证记录、限制与待办。
2. 按需阅读 `docs/PRD.md`（产品目标）与 `docs/GIT.md`（Git 规范）。旧设计方案仅作历史参考，不覆盖用户的最新要求。
3. 检查 `git status --short` 和相关源码，保留已有改动。端口、服务及部署状态必须实际确认，不能仅凭文档推断。

## 产品目标与设计约定

MingZhe 的个人技术博客，用于分享编程、AI、Agent 工具实践，整理层级笔记、读书摘录与个人项目。

- 前台导航：首页、博客、笔记、项目、关于。
- 保留动态星空背景、定制鼠标指针与蓝色柔光，未经明确要求不要重做。
- 黑白灰文字、透明背景、简洁排版；避免恢复黄蓝文字、纯黑卡片底色、装饰性“星域/观测”文案和右上箭头。
- 首页隐藏最近一篇与最近博客列表；摘录由管理台维护，探索主题标签背景透明。
- 项目页使用封面卡片布局，桌面三列、平板两列、手机单列；项目封面完整显示，不裁切。
- 管理台保持简洁、响应式，标识当前导航；写操作提供处理状态与结果反馈，删除需确认。
- 文章与笔记正文编辑使用共享 `MarkdownImageEditor`：默认在编辑区直接展示 Markdown 图片，源码模式才显示图片语法；保留原始 Markdown，不通过 HTML 回转保存。代码示例内的图片语法不能误转为图片。
- 中英文即时切换，不刷新整页；明暗模式使用太阳/月亮线条图标。

## 启动与检查

```bash
npm run dev           # 本地开发，默认 http://localhost:3000
npm run build         # 生产构建
npm run start         # 运行已构建的生产版本
npx tsc --noEmit      # 类型检查
npm run test:galaxy   # 现有界面约定检查
git diff --check      # 补丁格式检查
```

Windows 脚本位于 `scripts/`。`start.bat` 先构建，成功后启动生产服务；开发输出 `.next-dev`，生产输出 `.next`。不要让两个服务占用同一端口。Next.js 自动生成的 `next-env.d.ts` 路径变化不应作为功能改动提交。

## 架构与路由

Next.js 15 App Router、React 19、TypeScript、Tailwind v4、SQLite（sql.js WASM）、Drizzle ORM。

| 位置 | 用途 |
|---|---|
| `src/lib/db.ts`、`db-schema.ts` | 数据库初始化、表结构、磁盘持久化 |
| `src/lib/data.ts` | 文章查询与写入 |
| `src/lib/notes.ts`、`reading-excerpts.ts`、`projects.ts` | 笔记、摘录、项目数据 |
| `src/server-actions/` | 登录校验、写入与页面缓存失效 |
| `src/components/i18n-provider.tsx` | 中英文消息与客户端语言状态 |
| `src/app/layout.tsx` | 字体、Cookie 初始语言、主题 Provider |
| `src/app/globals.css`、`editorial.css` | 全局样式、主题变量、前后台布局 |
| `src/components/star-background.tsx` | 动态星空 |
| `src/components/header.tsx` | 导航、搜索、语言和主题按钮 |
| `src/lib/admin-auth.ts`、`src/middleware.ts` | 会话校验、管理台路由保护 |

前台路由：`/`、`/blog`、`/blog/[slug]`、`/notes`、`/notes/[id]`、`/projects`、`/about`。

管理台路由：`/admin`（文章）、`/admin/editor`、`/admin/editor/[id]`、`/admin/notes`、`/admin/notes/new`、`/admin/notes/[id]`、`/admin/projects`、`/admin/excerpts`、`/admin/images`、`/admin/import`。

登录：`/admin-login`。搜索接口：`/api/search`，供 Ctrl+F 模糊背景弹层检索公开博客与笔记。

## 数据与持久化

- 数据库页面必须声明 `export const dynamic = "force-dynamic"`，避免静态生成时执行 sql.js WASM。
- 使用 `getDb()`，避免自行重复初始化；写入后调用 `saveDb()`，Server Action 使用 `revalidatePath()` 更新相关前后台页面。
- 现有表：文章、笔记、读书摘录、项目。数据库变更必须兼容已有数据，禁止为升级功能清空内容。
- 项目表首次创建时插入博客示例；用户删除已有项目后不自动补回。
- `data/blog.db` 与 `public/uploads/` 是本地内容资产，不由 Git 备份。迁移或高风险操作前单独备份二者。
- Server Component 获取数据，传给客户端 View 组件渲染交互和翻译。
- 管理台文章列表使用 `getArticleSummaries()`，不传输全部正文；编辑页用 `getArticleById()` 按 ID 查询。`/admin/loading.tsx` 提供切页反馈，侧栏悬停或聚焦预加载。
- Server Action 已对当前页面执行 `revalidatePath()` 时，优先使用同次响应更新数据，不额外调用 `router.refresh()`；修改后需验证列表确实更新。

## 国际化与主题

根布局读取 `NEXT_LOCALE` 传给 `I18nProvider`，确保 SSR 与客户端语言一致。切换语言通过 `useSetLocale()` 更新本地状态和 Cookie，无需 `router.refresh()`；同步更新 HTML 的 lang。

主题使用 `next-themes`，默认深色，存储键 `galaxy-theme`，不默认跟随系统；浅色由 `.light` 覆盖。保留 Playfair Display、Crimson Pro、JetBrains Mono、DM Sans 字体。

## 认证、上传与内容

- 管理台使用表单登录和 `BLOG_ADMIN_SESSION` Cookie；middleware 将未登录管理台请求重定向至登录页。
- Server Action 可被独立调用，不能只依赖路由保护；受保护入口必须校验 `isAdminAuthenticated()`。
- 账号密码通过 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 配置；实际凭据不能写入文档或提交 Git。
- 图片保存在 `public/uploads/`，支持 JPG、PNG、GIF、WebP、SVG，单文件最大 10MB；Server Action 请求上限 11MB，为表单开销留余量。
- 项目链接只允许 HTTP(S) 或站内路径，输入必须校验，前台只展示公开项目。
- 文章使用 Markdown/MDX，gray-matter 解析 frontmatter，next-mdx-remote/rsc 渲染，配合 GFM、代码高亮与标题锚点。MDX 不等于已配置不可信代码沙箱。
- Giscus 组件已存在，实际可用性取决于 GitHub 配置，不得直接宣称评论已配置。

## 完成任务时

1. 按改动运行合适的检查；文档修改无需重跑应用构建。关键交互实际验证，类型检查不等于浏览器验收。
2. 更新 `docs/STATUS.md`：日期、完成事项、验证范围、未解决问题与待办；长期架构与规范变化同步更新本文件。
3. Git 操作前阅读 `docs/GIT.md`。按用户约定，每完成一个功能点或维护任务自动 `git add -A`、中文 `git commit`、`git push`，无需再次确认。提交前检查，避免混入无关或敏感内容。
4. 推送失败时保留本地提交并说明；未验证事项不能写为完成，Git 推送不代表云端部署。
