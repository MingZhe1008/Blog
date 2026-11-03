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

生产认证 Cookie 使用 Secure 属性，对外应通过 HTTPS 访问。

## 更新执行约定

每次完成改动并提交推送后，助手继续同步云端，无需再次询问。应用改动执行构建、备份、更新和健康检查；纯文档同步对应文件，不重启应用。用户当次明确要求仅本地、仅 demo 或不部署时例外。Git 推送本身仍不触发自动部署流水线，须实际执行并验证部署，保护云端数据并轮换至仅一份备份。

## 已部署环境（2026-11-02）

- 入口：`https://www.lyy12.cn/blog`，IP 的 `/blog` 入口也可通过现有 HTTP → HTTPS 跳转访问。
- 目录：`/home/zmz/item/blog/`；运行用户 `zmz`。本地内容首次迁移后，后续更新不得用本地数据库或 uploads 覆盖服务器内容。
- 博客独立使用 `/opt/blog-node/bin/node`（Node 22），没有更换 ToZ 使用的系统 Node。
- systemd 服务 `mingzhe-blog`，仅监听 `127.0.0.1:3000`，已启用开机启动与失败重启。模板见 `scripts/deploy/mingzhe-blog.service`。
- 复用现有 Nginx 和域名证书，`/etc/nginx/conf.d/toz-domain.conf` 与 `toz-sync.conf` 的 HTTPS server 中包含 `/etc/nginx/snippets/mingzhe-blog.conf`，模板见 `scripts/deploy/nginx-blog.conf`。原 `/toz/` 和同步接口保留。
- 配置凭据保存在服务器 `.env.local`，权限 600，不入 Git；沿用本地管理台凭据，不是 SSH 凭据。
- 本次上传本地生产构建，在 Linux 上安装依赖；本机 Windows 的 node_modules 不上传。TypeScript 配置在启动时需要 TypeScript，因此安装完整锁定依赖：`PATH=/opt/blog-node/bin:$PATH npm ci --no-audit --no-fund`。依赖安装验证通过，后续可在服务器运行 `npm run build` 再重启。
- 反向代理下的管理台跳转使用公网 Host/协议，并清除内部监听端口；代理必须覆盖 `X-Forwarded-Host` 和 `X-Forwarded-Proto`。

服务维护：

```bash
systemctl status mingzhe-blog
journalctl -u mingzhe-blog -n 100 --no-pager
systemctl restart mingzhe-blog
nginx -t && systemctl reload nginx
```

### 云端备份保留策略

云端博客部署备份最多保留最近一份，统一放在 `/home/zmz/item/blog-backups/`。当前保留 `before-folder-select-20261103-141022/`，包括旧应用、独立数据库/图片快照、原构建目录以及服务和 Nginx 配置。早期 `/root/blog-deploy-backup-20261102/` 和上传临时包已清理，不能再使用这些旧路径恢复。

后续部署先生成并校验新备份，分别保存 `data/blog.db` 与 `public/uploads/`；部署和健康检查成功后，删除上一份备份，仅保留本次更新前的快照。轮换期间可短暂并存，任务结束时最多一份。删除前核对绝对路径，禁止删除当前应用目录或尚未校验的新备份；部署失败时保留恢复所需备份，优先回滚。上传临时包使用完即清理，不在 `/root` 另存旧版副本。

恢复应用时不要默认恢复旧数据库与图片，避免覆盖部署后新增内容。构建成功后再重启服务，不要多进程同时写 SQLite 文件。本地内容备份保留在 `E:\Blog\Backups\`，本次云端清理不涉及本地归档。

## 内容兼容与开发约定

- `Link`、客户端 router 和 Server Action 的 `redirect` 使用不带部署前缀的应用内路径，由 Next.js 自动处理。
- 原生 `a`、`img`、表单 action、fetch、上传返回 URL 使用 `sitePath()`；已有公开 URL 交给 Next Link/router 前先通过 `appPath()` 转回应用内路径，避免双重前缀。
- 内容中的旧 `/uploads/...`、`/notes/...`、`/blog/[slug]` 在展示时转换，数据库与 Markdown 原文不重写。外部 HTTP(S) 链接保留。
- 缓存失效统一使用 `revalidateSitePath()`，覆盖应用布局标签和带前缀的具体 URL 标签。
- 数据库和图片的磁盘位置仍为 `data/blog.db`、`public/uploads/`，跨机器部署需单独迁移并备份。不得将 Next.js 反向代理配置为移除 `/blog` 后再转发。
- 不再提供旧根路径下的 `/admin`、`/notes` 等入口；同域其他应用可使用自己的路径。历史内容中的链接兼容不等于旧浏览器书签重定向。
