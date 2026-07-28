@echo off
chcp 65001 >nul
title Blog - Dev Server

echo ================================
echo   Blog Dev Server
echo   http://localhost:3000
echo ================================
echo.
echo [33mStarting Next.js dev server...[0m
echo [90mPress Ctrl+C to stop[0m
echo.

cd /d E:\Blog\Blog
npm run dev

pause
