# 架构决策记录 (ADR)

## ADR-001: 选择 Next.js 作为全栈框架

**日期**: 2026-07-28
**状态**: 已接受

### 背景

需要选择一个既能处理前端页面渲染，又能处理后端业务逻辑的框架。博主有 Java/Spring Boot 背景，但希望学习现代前端技术栈。

### 决策

选择 **Next.js 14+ (App Router) + TypeScript**。

### 理由

- 全栈能力：Server Actions 直接读写 SQLite，无需单独搭建 API 服务
- SSR/SSG：文章页服务端渲染，SEO 友好，首屏加载快
- MDX 原生支持：通过 `@next/mdx` 或 `next-mdx-remote` 渲染 MDX
- AI 生态：Vercel AI SDK、OpenAI/Anthropic SDK 天然适配，为后期知识地图等 AI 功能铺路
- TypeScript：渐进类型，Java 开发者迁移友好

### 备选方案

| 方案 | 放弃原因 |
|---|---|
| Spring Boot + Thymeleaf | 知识地图等交互效果实现笨重，前端自由度低 |
| Nuxt 3 (Vue) | 功能相近但用户倾向 React 生态 |
| Astro | 在线编辑等动态功能需额外后端，复杂度反而更高 |

### 后果

- 需要学习 React/TypeScript/前端工程化，有约 1-2 周学习成本
- 放弃已有 Java 后端经验的部分复用
- 部署需 Node.js 运行时（相比 Java JAR 包稍复杂）

---

## ADR-002: 选择 SQLite + Drizzle ORM 作为数据存储

**日期**: 2026-07-28
**状态**: 已接受

### 背景

个人博客需要存储文章数据（内容、标签、状态），同时要求轻量运维，适合个人开发者。

### 决策

选择 **SQLite (better-sqlite3) + Drizzle ORM**。

### 理由

- 零运维：一个 `.db` 文件，无需安装数据库服务
- 同步 API：`better-sqlite3` 是同步的，与 Next.js Server Actions 配合更好
- 备份简单：复制文件即备份
- Drizzle ORM：TypeScript-first，类型安全，migration 工具链完整
- 迁移成本低：如果未来需要 PostgreSQL，Drizzle 支持切换（只需换 driver）
- 性能足够：个人博客日 PV 千级，SQLite 单表百万行无压力

### 备选方案

| 方案 | 放弃原因 |
|---|---|
| PostgreSQL | 需要运维数据库服务，对个人博客过度设计 |
| MySQL | 同上 |
| Notion CMS | 依赖第三方，离线不可用 |
| 纯 Markdown 文件 | 不支持在线编辑（或需要 Git 后端，复杂度增加） |

### 后果

- 并发写入限制（SQLite 单写者），但博客场景不影响
- 部署时需要持久化 `.db` 文件（Docker volume 挂载）

---

## ADR-003: 选择 Giscus 作为评论系统

**日期**: 2026-07-28
**状态**: 已接受

### 背景

博客需要评论功能，要求 GitHub 账号登录。不希望在早期自建评论系统。

### 决策

选择 **Giscus**，基于 GitHub Discussions 的开源评论组件。

### 理由

- GitHub 登录：天然满足需求，无需额外开发
- 零运维：评论数据存储在 GitHub Discussions，不占用自有数据库
- 5 分钟接入：一个 `<Giscus />` React 组件
- 支持 Markdown：评论支持代码高亮、引用
- 开源免费：无商业依赖

### 备选方案

| 方案 | 放弃原因 |
|---|---|
| Utterances | 基于 Issues 而非 Discussions，功能更少 |
| 自建评论系统 | 开发量大（登录、Session、CRUD、反 spam），早期不值得 |
| Gitalk | 与 Utterances 类似，维护活跃度不如 Giscus |

### 后果

- 依赖 GitHub 可用性（GitHub 挂了评论区就挂了，影响可控）
- 评论者必须拥有 GitHub 账号（对目标读者群合理）
- 无法自定义评论样式（受限但不影响使用）

---

## ADR-004: 选择 ByteMD 作为 Markdown 编辑器

**日期**: 2026-07-28
**状态**: 已接受

### 背景

博客需要在线 Markdown 编辑器，支持 GFM 语法、代码高亮、实时预览。

### 决策

选择 **ByteMD**（掘金同款编辑器）。

### 理由

- 掘金验证：中文技术社区最大平台使用，稳定性有保证
- 插件生态：支持数学公式、Mermaid 图表、代码高亮
- React 原生：作为 React 组件直接嵌入 Next.js
- GFM 完整支持：表格、任务列表、删除线等
- 继续开发中：npm 下载量高，GitHub 活跃

### 备选方案

| 方案 | 放弃原因 |
|---|---|
| Milkdown | 插件化架构但学习曲线高，对简单博客过度设计 |
| MDX Editor | 偏向 Notion 风格，技术文章场景不如 ByteMD |
| Monaco Editor | 代码编辑器，非 Markdown 专用 |
| Tiptap | 富文本编辑器，对代码块支持不如 MD 原生 |

### 后果

- 编辑器体积约 200KB+ gzipped，首屏加载需优化（管理后台懒加载即可）
- 部分高级插件可能需要自行封装

---

## ADR-005: 选择 Tailwind CSS + shadcn/ui 作为 UI 方案

**日期**: 2026-07-28
**状态**: 已接受

### 背景

博客需要一套样式方案，既要能快速开发标准组件，又要能自由定制个性化样式。

### 决策

选择 **Tailwind CSS + shadcn/ui**。

### 理由

- Tailwind：Next.js 官方推荐，无样式命名冲突，暗色模式内建支持
- shadcn/ui：源码复制到项目，完全可定制，不是黑盒 npm 包
- 组合灵活：按钮/表单/对话框用 shadcn，页面布局用 Tailwind 手写
- TypeScript 类型完善
- 社区活跃，组件丰富

### 备选方案

| 方案 | 放弃原因 |
|---|---|
| 纯 CSS/SCSS | 开发效率低，暗色模式需手写 |
| Ant Design | 组件风格难以定制，对博客过度设计 |
| Radix UI（裸用） | shadcn/ui 就是基于 Radix 的封装，直接用 Radix 工作量大 |

### 后果

- 需学习 Tailwind class 命名（约半天适应期）
- 页面 HTML 中 class 较长，但提取为组件后不影响可读性

---

## ADR-006: 选择 Pagefind 作为全文搜索方案

**日期**: 2026-07-28
**状态**: 已接受

### 背景

博客需要同时支持标签筛选和全文搜索。标签筛选走数据库，全文搜索需要额外方案。

### 决策

**标签筛选**：SQLite 查询，Server Action
**全文搜索**：选择 **Pagefind**，构建时生成静态索引。

### 理由

- 零运行时开销：构建完成后索引是纯静态文件
- 搜索速度快：Pagefind 在浏览器端执行，无网络延迟
- 零依赖：不依赖外部搜索服务（Algolia 等收费）
- 中文支持：Pagefind 对中文分词基本可用
- 与 Next.js 集成简单：构建后处理 + 一个搜索组件

### 备选方案

| 方案 | 放弃原因 |
|---|---|
| FlexSearch | 需在客户端加载索引，大内容场景客户端负担重 |
| Algolia | 收费，对个人博客过度 |
| SQLite FTS5 | 需要运行时查询，增加服务器负载 |
| 不做全文搜索 | 影响用户体验 |

### 后果

- Pagefind 构建增加约 3-5 秒构建时间
- 中文分词不如专用搜索引擎精确（对个人博客够用）
- 索引文件需随部署一起更新

---

## ADR-007: 选择本地文件系统作为图片存储（前期）

**日期**: 2026-07-28
**状态**: 已接受

### 背景

编辑器中上传的图片需要存储。前期无云服务依赖，后期可能迁移到 OSS。

### 决策

**前期**：本地文件系统（`/public/uploads/`）
**后期**：阿里云 OSS / 腾讯云 COS
**设计保障**：通过 `ImageStorage` 接口抽象，方便切换。

### 理由

- 前期快速：不需要注册云服务、配置 SDK
- 零成本：不产生存储和流量费用
- 开发体验好：本地 `next dev` 直接读取
- 接口抽象：`save(name, buffer) → url` 和 `delete(url) → void` 两个方法，切换 OSS 只需实现同一接口

### 后果

- 备份需要打包 uploads 目录
- 多实例部署时无法共享（单机部署无影响）
- 后期迁移需要批量上传到 OSS 并更新数据库

---

## ADR-008: 选择 Basic Auth 作为管理员认证（前期）

**日期**: 2026-07-28
**状态**: 已接受

### 背景

管理后台（`/admin`）需要认证保护，前期只有博主一人使用。

### 决策

**前期**：HTTP Basic Auth，密码通过环境变量 `ADMIN_PASSWORD` 配置
**后期**：NextAuth.js + GitHub OAuth

### 理由

- 实现简单：Next.js middleware 校验 `Authorization` header，约 30 行代码
- 无外部依赖：不需要数据库存用户表，不需要 Session
- 安全基础：HTTPS 下 Basic Auth 是安全的
- 后期可切换：NextAuth 接入时只改 middleware，不影响业务代码

### 后果

- 不支持多用户（单博主场景无影响）
- 浏览器原生弹窗登录（UI 不美观但不影响功能）

---

## ADR-009: 选择 MDX 作为文章内容格式

**日期**: 2026-07-28
**状态**: 已接受

### 背景

文章需要支持 Markdown 基本语法，同时为后期的知识地图等交互组件预留嵌入能力。

### 决策

选择 **MDX**（Markdown + JSX）。

### 理由

- 保持 Markdown 写作体验：技术文章的主体仍是 MD
- 嵌入能力：后期 `<KnowledgeMap />`、`<Demo />` 等组件可直接写在文章里
- 渐进增强：不写 JSX 时就是纯 Markdown，零额外成本
- 生态成熟：`next-mdx-remote` 支持服务端渲染 MDX

### 后果

- MDX 编译比纯 MD 稍慢（约 10-20ms/篇，不影响使用）
- MDX 中嵌入的组件需要提前注册
