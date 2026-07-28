# Git 操作指南

## 首次推送（当前状态）

```bash
# 添加远程仓库（使用 token 认证）
git remote add origin https://<your-token>@github.com/MingZhe1008/Blog.git

# 推送 master 分支
git push -u origin master
```

## 日常提交流程

```bash
# 1. 查看改动
git status

# 2. 添加文件
git add .

# 3. 提交
git commit -m "feat: 描述你的改动"

# 4. 推送
git push
```

## Commit Message 规范

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    样式/格式化（不影响逻辑）
refactor: 代码重构
chore:    构建/依赖/杂项

示例：
git commit -m "feat: 添加文章搜索功能"
git commit -m "fix: 修复暗色模式切换闪烁"
git commit -m "docs: 更新 ADR 文档"
```

## 分支工作流

```bash
# 创建新分支
git checkout -b feat/search

# 切换分支
git checkout master
git checkout feat/search

# 合并分支
git checkout master
git merge feat/search

# 删除已完成的分支
git branch -d feat/search
```

## 回退操作

```bash
# 撤销工作区改动（未 add）
git checkout -- <file>

# 撤销暂存区（已 add 未 commit）
git reset HEAD <file>

# 撤销最近一次 commit（保留改动）
git reset --soft HEAD~1

# 撤销最近一次 commit（丢弃改动）
git reset --hard HEAD~1

# 查看历史
git log --oneline -10
```

## 数据备份

```bash
# 数据库文件和上传的图片不受 Git 管理（在 .gitignore 中）
# 手动备份到其他位置：
copy E:\Blog\Blog\data\blog.db E:\Backup\blog-$(Get-Date -Format 'yyyyMMdd').db
copy -r E:\Blog\Blog\public\uploads E:\Backup\uploads-$(Get-Date -Format 'yyyyMMdd')
```
