# 博客前端设计规范

## 设计方向：Warm Terminal

> "深夜书房里亮着一盏暖灯，屏幕上代码在暗色背景中流淌。"

不是冷冰冰的开发者文档站，而是一个有温度、有个性的个人空间。深色为主、暖色点缀、衬线标题与等宽正文的碰撞，像一本精心排版的纸质技术杂志被搬到了屏幕上。

**记住三个词：温暖、精准、有个性。**

---

## 配色方案（亮暗双模）

亮色模式不是白底黑字，而是暖白底 + 深棕文字；暗色模式不是纯黑，而是深灰褐底 + 暖白文字。

### 暗色模式（默认主题）

```
背景色系 — 暖灰褐底
--bg-base:        #1b1814     主背景（不是纯黑，带微微褐底）
--bg-surface:     #231f1a     卡片 / 代码块
--bg-elevated:    #2a2520     hover 状态 / 浮动元素
--bg-muted:       #171411     更暗的底色

文字色系 — 纸白
--text-primary:   #f0e6d9     正文（暖白，不是冷白）
--text-secondary: #a39788     次要文字（暖灰）
--text-muted:     #6b6258     最弱的文字

强调色 — 琥珀 / 铜
--accent:         #d4913e     主强调色（链接、按钮、高亮）
--accent-hover:   #e5a84f     hover 加深
--accent-subtle:  rgba(212, 145, 62, 0.12)  微妙强调（标签背景等）

边框
--border:         #2e2923     分割线、卡片边框
--border-hover:   #4a4138     hover 边框
```

### 亮色模式

```
背景色系 — 暖纸底
--bg-base:        #faf7f2     暖白底（不是冷白 #fff）
--bg-surface:     #f3efe8     卡片
--bg-elevated:    #ede7dd     hover
--bg-muted:       #e8e2d7     代码块背景

文字色系 — 深棕
--text-primary:   #2d2218     正文
--text-secondary: #6b5d4f     次要文字
--text-muted:     #9b8d7f     最弱

强调色 — 铜绿
--accent:         #b87333     主强调（亮色下稍深）
--accent-hover:   #965a26
--accent-subtle:  rgba(184, 115, 51, 0.1)

边框
--border:         #e0d8cc
--border-hover:   #c4b8a4
```

**Tailwind 配置**：用 OKLCH 自定义这些色值，覆盖 `neutral` 为暖灰系，`amber` 为强调色。

---

## 字体方案

```
Display (标题):     'Playfair Display', serif
Body (正文):        'Crimson Pro', serif
Mono (代码/标签):    'JetBrains Mono', monospace
UI (导航/按钮等):    'DM Sans', sans-serif
```

**加载策略**：
- Playfair Display + Crimson Pro + JetBrains Mono + DM Sans，全部从 `next/font/google` 加载
- 子集化：latin + latin-ext
- Playfair Display 用 variable 版本，控制在 700/900 两个 weight
- Crimson Pro variable，400-600

**排版层级**：

| 元素 | 字体 | 大小 | 字重 | 行高 |
|---|---|---|---|---|
| H1（文章标题） | Playfair Display | 2.5rem / 40px | 900 | 1.2 |
| H2 | Playfair Display | 1.75rem / 28px | 700 | 1.3 |
| H3 | DM Sans | 1.25rem / 20px | 600 | 1.4 |
| 正文 | Crimson Pro | 1.125rem / 18px | 400 | 1.8 |
| 小字/日期/标签 | DM Sans | 0.8rem / 13px | 500 | 1.5 |
| 代码 | JetBrains Mono | 0.875rem / 14px | 400 | 1.65 |
| 导航 | DM Sans | 0.9rem / 14px | 500 | — |

---

## 首页布局

```
┌────────────────────────────────────────────┐
│                                            │
│        ┌──────────────────────────┐        │
│        │                          │        │
│        │    [头像 — 手绘风格]      │        │
│        │                          │        │
│        │   我是 [Name]             │        │
│        │   ———————————————        │        │
│        │   一行简介，像名片上的     │        │
│        │   个人标语。              │        │
│        │                          │        │
│        │   [GitHub] [X] [RSS]     │        │
│        └──────────────────────────┘        │
│                                            │
│   ── 文章 · Articles ──────────────────    │
│                                            │
│   [全部] [Rust] [AI] [Agent] [随笔]   ← 标签
│                                            │
│   ┌ 2024.07.28 ───────────────────────┐   │
│   │                                    │   │
│   │  Rust 所有权：从困惑到理解          │   │
│   │  所有权不是 Rust 发明的，但它把      │   │
│   │  这件事做到了极致……                 │   │
│   │                                    │   │
│   │  #rust #系统编程  ·  8 min read     │   │
│   └────────────────────────────────────┘   │
│                                            │
│   ┌ 2024.07.25 ───────────────────────┐   │
│   │  ...                               │   │
│   └────────────────────────────────────┘   │
│                                            │
│                    ← Older  Newer →        │
│                                            │
│   ─────────────────────────────────────    │
│   © 2026 · Built with curiosity            │
└────────────────────────────────────────────┘
```

**关键点**：
- Header 不单独一行，融在 Hero 区上方，只有导航链接和暗色切换
- Hero 区大留白，头像偏小，文字居中
- 文章列表不用卡片式，用**横向分割线**分隔，像杂志目录
- 日期作为 section header 横跨整行，带左右分割线
- hover 时标题颜色从 text-primary 过渡到 accent

---

## 文章详情页

```
┌──────────────────────────────────────┐
│  [← Back]                    [🌙]    │  ← 极简顶栏
├──────────────────────────────────────┤
│                                      │
│                    2024.07.28        │
│                                      │
│  Rust 所有权：从困惑到理解            │  ← Playfair Display Black
│                                      │
│  #rust #系统编程  ·  8 min read      │
│                                      │
│  ─────────────────────────────────── │
│                                      │
│  正文开始。Crimson Pro 18px，行高     │
│  1.8，读起来像一本排版精良的书。      │
│                                      │
│  ## 这是 H2                           │
│  Playfair Display Bold，与正文形     │
│  成优雅对比。                         │
│                                      │
│  > 引用块左边没有竖线，而是用         │
│  > accent 色的 「 引导符开头         │
│                                      │
│  ```rust                              │
│  fn main() {                         │
│      println!("代码块总是暗色");      │
│  }                                   │
│  ```                                 │
│                                      │
│  ─── · ─── · ───                     │  ← 三个装饰点分隔
│                                      │
│  ← 上一篇：xxx                       │
│  下一篇：xxx →                       │
│                                      │
│  ┌──────────────────────────────┐    │
│  │   Thoughts? 💬                │    │
│  │  (Giscus 评论区)              │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

**关键细节**：
- **引用块**：不用传统的左边框，改成 `「` 装饰符（`::before`），accent 色
- **分隔线**：不用 `<hr>` 实线，用 `···` 三个居中的装饰点
- **TOC**：桌面端右侧悬浮，用竖线连接各层级，当前阅读位置高亮
- **代码块**：统一暗色主题（亮色模式下也是暗底），加文件名标题栏和复制按钮
- **链接**：accent 色 + 波浪下划线（`text-decoration-style: wavy`），hover 变实线

---

## 管理后台

保持简洁实用，不需要花哨，但配色保持一致：

- 侧边栏 `bg-surface`，宽度 240px
- 表格用 `border` 色分割线
- 编辑器区域占满剩余空间
- ByteMD 默认工具栏，暗色适配用 ByteMD 的 `dark` 主题或自定义 CSS

---

## 动效

**克制但有存在感：**

1. **页面加载**：Hero 区文字从下方 20px fade in，stagger 100ms，持续 400ms ease-out
2. **文章列表 hover**：标题颜色过渡，300ms
3. **暗色切换**：`transition-colors duration-300` 全局，但 `::view-transition` 做圆形扩散效果（如果用 View Transitions API）
4. **TOC 高亮**：滚动时当前标题平滑高亮，无跳跃
5. **搜索弹窗**：backdrop-blur + scale(0.95 → 1) + opacity，200ms

不动效的地方：
- 页面切换不设过渡动画
- 不设滚动视差
- 不设光标跟随效果

---

## 代码块样式

```
┌─────────────────────────────────────┐
│  main.rs                    📋      │  ← bg-muted，标题栏不设背景色差
│  1  fn main() {                    │  ← 行号用 text-muted
│  2      let x = String::from(      │
│  3          "hello"                │  ← 代码高亮：关键字 accent，字符串 green
│  4      );                         │
│  5      println!("{x}");           │
│  6  }                              │
└─────────────────────────────────────┘
```

- Shiki 渲染，主题 `github-dark-dimmed`，统一暗色底
- 行号通过 CSS `counter` 生成
- 代码块圆角 `8px`，`border` 色边框
- 行内代码：`bg-muted`，`px-1.5`，`rounded`，`text-accent`，`font-mono text-sm`
- diff 高亮：`+` 行绿色底，`-` 行红色底

---

## 响应式

| 断点 | 行为 |
|---|---|
| < 640px | 正文 16px（比桌面 18px 小），TOC 折叠到顶部下拉 |
| < 768px | Hero 区上下留白缩小，文章列表去掉日期分隔线 |
| ≥ 768px | 正常布局 |
| ≥ 1024px | TOC 右侧 sticky 出现 |
| ≥ 1280px | 正文区 max-w-[680px]，更多两侧留白 |

---

## 组件树

```
RootLayout (bg-base, text-primary, transition-colors)
├── Header (sticky, backdrop-blur-sm, bg-base/80)
│   ├── Logo (Playfair Display, accent)
│   ├── NavLinks (DM Sans, text-secondary)
│   ├── SearchTrigger (⌘K 样式按钮)
│   └── ThemeToggle (自定义 icon，不是默认 emoji)
├── Main
└── Footer (DM Sans, text-muted, 小字)

HomePage
├── Hero
│   ├── Avatar (rounded-full, border-accent)
│   ├── Name (Playfair Display Black, 3xl)
│   ├── Tagline (Crimson Pro, text-secondary)
│   └── SocialLinks (icon buttons, hover → accent)
├── TagFilter (chips, DM Sans)
├── ArticleList
│   └── ArticleItem × N
│       ├── DateDivider (sticky 或 inline)
│       ├── Title (Playfair Display)
│       ├── Excerpt (Crimson Pro, 2-line clamp)
│       └── Meta (DM Sans, tags + reading time)
└── Pagination

BlogDetailPage
├── ArticleHeader
│   ├── BackLink
│   ├── Date
│   ├── Title (H1, Playfair Display Black)
│   └── Meta
├── TOC (sticky, right sidebar)
├── MDXContent (prose 自定义)
│   ├── H2 (Playfair Display)
│   ├── H3 (DM Sans)
│   ├── Paragraph (Crimson Pro)
│   ├── Blockquote ("「" prefix)
│   ├── CodeBlock (Shiki + toolbar)
│   ├── InlineCode
│   ├── Link (wavy underline)
│   └── CustomComponents (KnowledgeMap etc.)
├── ArticleNav
└── GiscusComments

AdminLayout
├── Sidebar
│   ├── Logo → 返回前台
│   ├── NavItems
│   └── ImportMD
└── ContentArea

SearchDialog
├── Overlay (backdrop-blur)
└── PagefindUI
```
