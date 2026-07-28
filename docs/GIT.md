# Git 操作指南

## 认证方式

使用 SSH 认证（已配置），无需 token。

```bash
# 测试连接
ssh -T git@github.com
```

## 日常提交流程

```bash
cd E:\Blog\Blog

# 1. 查看改动
git status

# 2. 添加所有文件
git add -A

# 3. 提交（使用中文，格式见下方规范）
git commit -m "类型: 中文描述"

# 4. 推送
git push
```

## Commit Message 规范

提交说明统一使用**中文**，格式：`类型: 简述`

| 类型 | 说明 | 示例 |
|---|---|---|
| `feat` | 新功能 | `feat: 首页添加fade-up加载动画` |
| `fix` | Bug 修复 | `fix: 修复亮色模式按钮文字不可见` |
| `docs` | 文档更新 | `docs: 更新 Git 操作指南` |
| `style` | 样式调整 | `style: 标签去掉#号前缀` |
| `refactor` | 代码重构 | `refactor: 拆分数据层和 Server Actions` |
| `chore` | 构建/杂项 | `chore: 更新依赖版本` |

**示例：**

```bash
git commit -m "feat: 添加中英文切换功能"
git commit -m "fix: 修复 hydration 不匹配"
git commit -m "docs: 在 GIT.md 中补充 SSH 配置"
git commit -m "style: 导航栏改用黑体加粗"
```

## 分支工作流

```bash
git checkout -b feat/功能名     # 创建分支
git checkout master             # 切换分支
git merge feat/功能名           # 合并分支
git branch -d feat/功能名       # 删除分支
```

## 回退操作

```bash
git checkout -- <file>          # 撤销工作区改动
git reset HEAD <file>           # 撤销暂存区
git reset --soft HEAD~1         # 撤销 commit（保留改动）
git reset --hard HEAD~1         # 撤销 commit（丢弃改动）
git log --oneline -10           # 查看历史
```

## 数据备份

```bash
# 数据库和上传文件不受 Git 管理（在 .gitignore 中）
copy E:\Blog\Blog\data\blog.db E:\Backup\blog-%date:~0,4%%date:~5,2%%date:~8,2%.db
```
