@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Bartolo 3D - Actualizar
echo ==============================================
echo   Bartolo 3D - Descargar los cambios de Claude
echo ==============================================
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No encuentro Git. Instala Git para Windows desde https://git-scm.com y vuelve a intentar.
  pause
  exit /b 1
)
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Esta carpeta no viene de "git clone". Sigue los pasos de instalacion con Git que te dio Claude.
  pause
  exit /b 1
)
git pull --ff-only
if errorlevel 1 (
  echo.
  echo [ERROR] No se pudo actualizar. Copia el mensaje de arriba y envialo a Claude.
  pause
  exit /b 1
)
echo.
echo Actualizado. Si cambiaron las librerias, RENDERIZAR.bat las instala solo.
pause
