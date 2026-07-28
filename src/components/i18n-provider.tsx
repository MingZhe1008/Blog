"use client";

import { NextIntlClientProvider } from "next-intl";
import { useMemo } from "react";

type Messages = Record<string, Record<string, string>>;

const zh: Messages = {
  common: {
    home: "首页",
    articles: "文章",
    blog: "博客",
    about: "关于",
    back: "返回",
    viewAll: "查看全部 →",
    search: "搜索",
    searchPlaceholder: "搜索文章…",
    noResults: "没有找到相关文章",
    poweredBy: "Built with curiosity",
  },
  home: {
    greeting: "你好，我是",
    bio: "记录编程语言、AI、Agent 工具的学习与使用心得。",
    recent: "· · · 最近文章",
    noArticles: "还没有发布文章。",
    github: "GitHub",
    articles: "文章",
  },
  blog: {
    title: "文章",
    noArticles: "暂无文章。",
    newer: "← 较新",
    older: "较早 →",
    all: "全部",
    minRead: "分钟阅读",
  },
  post: {
    backToArticles: "← 返回文章列表",
    previous: "上一篇",
    next: "下一篇",
    thoughts: "欢迎留言",
    publishedOn: "发布于",
  },
  admin: {
    title: "管理后台",
    articles: "文章",
    newPost: "新建文章",
    importMD: "导入 Markdown",
    backToBlog: "← 回到博客",
    noArticles: "还没有文章，创建你的第一篇吧！",
    title_col: "标题",
    status: "状态",
    tags: "标签",
    updated: "更新",
    actions: "操作",
    edit: "编辑",
    delete: "删除",
    draft: "草稿",
    published: "已发布",
    confirmDelete: "确定删除这篇文章？此操作不可撤销。",
    saveDraft: "保存草稿",
    saveDrafting: "保存中…",
    publish: "发布",
    publishing: "发布中…",
    viewPost: "查看文章 →",
    importTitle: "导入 Markdown 文件",
    dragDrop: "拖拽 .md 文件到此处，或点击选择",
    chooseFile: "选择文件",
    importing: "导入中…",
    importSuccess: "✅ 导入成功",
    importFailed: "❌ 导入失败",
    expectedFormat: "支持的 frontmatter 格式：",
    label_title: "标题",
    label_slug: "Slug",
    label_tags: "标签",
    label_coverImage: "封面图 URL",
    label_excerpt: "摘要",
    label_content: "内容 (Markdown)",
    addTag: "添加",
    placeholder_title: "文章标题",
    placeholder_slug: "article-slug",
    placeholder_tag: "添加标签…",
    placeholder_coverImage: "https://…",
    placeholder_excerpt: "简短摘要（可选）",
    placeholder_content: "# 开始写作…\n\n在此输入 Markdown 内容。",
  },
  locale: {
    switchTo: "English",
    label: "语言",
  },
};

const en: Messages = {
  common: {
    home: "Home",
    articles: "Articles",
    blog: "Blog",
    about: "About",
    back: "Back",
    viewAll: "View all →",
    search: "Search",
    searchPlaceholder: "Search articles…",
    noResults: "No articles found",
    poweredBy: "Built with curiosity",
  },
  home: {
    greeting: "Hello, I'm",
    bio: "Writing about programming languages, AI, and agent tools.",
    recent: "· · · Recent",
    noArticles: "No articles published yet.",
    github: "GitHub",
    articles: "Articles",
  },
  blog: {
    title: "Articles",
    noArticles: "No articles yet.",
    newer: "← Newer",
    older: "Older →",
    all: "All",
    minRead: "min read",
  },
  post: {
    backToArticles: "← Back to articles",
    previous: "Previous",
    next: "Next",
    thoughts: "Thoughts?",
    publishedOn: "Published on",
  },
  admin: {
    title: "Admin",
    articles: "Articles",
    newPost: "New Post",
    importMD: "Import MD",
    backToBlog: "← Back to Blog",
    noArticles: "No articles yet. Create your first one!",
    title_col: "Title",
    status: "Status",
    tags: "Tags",
    updated: "Updated",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    draft: "Draft",
    published: "Published",
    confirmDelete: "Delete this article? This cannot be undone.",
    saveDraft: "Save Draft",
    saveDrafting: "Saving…",
    publish: "Publish",
    publishing: "Publishing…",
    viewPost: "View post →",
    importTitle: "Import Markdown",
    dragDrop: "Drag & drop a .md file here, or click to select",
    chooseFile: "Choose File",
    importing: "Importing…",
    importSuccess: "✅ Imported",
    importFailed: "❌ Failed",
    expectedFormat: "Expected frontmatter format:",
    label_title: "Title",
    label_slug: "Slug",
    label_tags: "Tags",
    label_coverImage: "Cover Image URL",
    label_excerpt: "Excerpt",
    label_content: "Content (Markdown)",
    addTag: "Add",
    placeholder_title: "Post title",
    placeholder_slug: "post-slug",
    placeholder_tag: "Add tag…",
    placeholder_coverImage: "https://…",
    placeholder_excerpt: "Brief summary (optional)",
    placeholder_content: "# Start writing…\n\nYour markdown content here.",
  },
  locale: {
    switchTo: "中文",
    label: "Language",
  },
};

const messagesMap: Record<string, Messages> = { zh, en };

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useMemo(() => {
    // Read from cookie or navigator
    if (typeof document === "undefined") return "zh";
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];
    if (cookie === "en" || cookie === "zh") return cookie;
    const nav = navigator.language?.startsWith("zh") ? "zh" : "en";
    return nav;
  }, []);

  const messages = messagesMap[locale] ?? zh;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
