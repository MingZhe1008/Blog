@echo off
chcp 65001 >nul
title Blog - Production Server

echo ================================
echo   Blog Production Server
echo   http://localhost:3000
echo ================================
echo.
echo [33mStarting Next.js production server...[0m
echo [90mPress Ctrl+C to stop[0m
echo.

cd /d E:\Blog\Blog
npm run start

pause
