# 星图航行实现计划

## 任务 1：建立视觉契约测试

- 文件：`tests/galaxy-ui.test.mjs`、`package.json`
- 描述：用源码契约锁定动态星空、天体导航、星系节点与 reduced-motion 降级。
- 验证：先运行 `npm run test:galaxy` 并确认失败。

## 任务 2：实现公共星空外壳

- 文件：`src/components/galaxy-background.tsx`、`src/app/(main)/layout.tsx`、`src/app/globals.css`
- 描述：增加纯 CSS 星流、星云、噪点、全局星系配色和减少动态效果支持。
- 验证：契约测试通过；公共页面有装饰层且不拦截交互。

## 任务 3：实现天体导航

- 文件：`src/components/header.tsx`、`src/components/theme-toggle.tsx`、`src/components/locale-switcher.tsx`
- 描述：用太阳、星簇、月亮和坐标标记构成导航，保留可访问文字与键盘焦点。
- 验证：TypeScript 构建通过；导航路由、语言和主题操作保持不变。

## 任务 4：实现首页星图

- 文件：`src/app/(main)/home-view.tsx`、`src/components/galaxy-node.tsx`
- 描述：重构 Hero 主星与轨道，最近文章使用不对称星系节点；移动端改为纵向航线。
- 验证：0 篇与 1–5 篇文章都能正确渲染，链接仍指向原文章路由。

## 任务 5：统一文章目录入口

- 文件：`src/components/article-card.tsx`、`src/app/(main)/blog/blog-list-view.tsx`、`src/components/tag-filter.tsx`
- 描述：将列表卡片调整为观测记录/行星节点语言，与首页共享视觉系统。
- 验证：分页、标签筛选和阅读时间信息保持可用。

## 任务 6：验证与审查

- 文件：`review.md`、`final_report.md`
- 描述：运行契约测试与生产构建，检查规范符合性、性能、响应式和无障碍风险。
- 验证：测试与构建全部通过，无阻塞级审查问题。
