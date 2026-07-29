#!/bin/bash
# Git 提交推送脚本
# 用法: ./scripts/git-commit.sh "提交说明"

cd "$(dirname "$0")/.."

MESSAGE="${1:-chore: 日常更新}"

echo "=== Git 提交推送 ==="
echo "提交说明: $MESSAGE"
echo ""

git add -A
git commit -m "$MESSAGE"
git push

echo ""
echo "完成。"
