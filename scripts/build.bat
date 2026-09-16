@echo off
chcp 65001 >nul
title Blog - Production Build

echo ================================
echo   Blog Build
echo ================================
echo.

cd /d "%~dp0.."

echo [33m[1/2] Building...[0m
call npm run build
if %errorlevel% neq 0 (
    echo [31mBuild failed! Check errors above.[0m
    pause
    exit /b %errorlevel%
)

echo.
echo [32m[2/2] Build complete![0m
echo.
echo Run start.bat to serve the production build.

pause
