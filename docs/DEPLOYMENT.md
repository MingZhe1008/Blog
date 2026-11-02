# /blog 子路径部署

整个应用固定挂载在 `/blog`，由 `next.config.ts` 的 `basePath` 和 `src/lib/site-paths.ts` 统一定义。修改该前缀需要重新构建。

| 用途 | 对外地址 |
|---|---|
| 首页 | `/blog` |
| 文章列表、详情 | `/blog/articles`、`/blog/articles/[slug]` |
| 笔记、项目、关于 | `/blog/notes`、`/blog/projects`、`/blog/about` |
| 管理台、登录 | `/blog/admin`、`/blog/admin-login` |
| 搜索 | `/blog/api/search` |
| 上传图片、构建资源 | `/blog/uploads/...`、`/blog/_next/...` |

## 运行

开发使用 `npm run dev`，访问 `http://localhost:3000/blog`。
生产使用 `npm run build`，成功后 `npm run start`。账号密码通过服务器环境变量配置，不写进仓库。

## Nginx 示例

以下配置放在已有 `server` 中，端口按实际 Next.js 服务调整。代理时保留完整的 `/blog` 前缀，`proxy_pass` 后不附加 URI 或尾斜杠。

```nginx
location = /blog {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location ^~ /blog/ {
    client_max_body_size 11m;
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering off;
}
```

本次未连接服务器验证 Nginx。生产认证 Cookie 使用 Secure 属性，对外应通过 HTTPS 访问。

## 内容兼容与开发约定

- `Link`、客户端 router 和 Server Action 的 `redirect` 使用不带部署前缀的应用内路径，由 Next.js 自动处理。
- 原生 `a`、`img`、表单 action、fetch、上传返回 URL 使用 `sitePath()`；已有公开 URL 交给 Next Link/router 前先通过 `appPath()` 转回应用内路径，避免双重前缀。
- 内容中的旧 `/uploads/...`、`/notes/...`、`/blog/[slug]` 在展示时转换，数据库与 Markdown 原文不重写。外部 HTTP(S) 链接保留。
- 缓存失效统一使用 `revalidateSitePath()`，覆盖应用布局标签和带前缀的具体 URL 标签。
- 数据库和图片的磁盘位置仍为 `data/blog.db`、`public/uploads/`，跨机器部署需单独迁移并备份。不得将 Next.js 反向代理配置为移除 `/blog` 后再转发。
- 不再提供旧根路径下的 `/admin`、`/notes` 等入口；同域其他应用可使用自己的路径。历史内容中的链接兼容不等于旧浏览器书签重定向。
