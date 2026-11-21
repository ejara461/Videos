@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Bartolo 3D - Render
echo ==============================================
echo   Bartolo 3D - Render del video
echo ==============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No encuentro Node.js.
  echo Instala la version LTS desde https://nodejs.org y vuelve a hacer doble clic.
  echo.
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node -v') do echo Node.js encontrado: %%v
if not exist "public\bartolo_moto.png" (
  echo [ERROR] Falta public\bartolo_moto.png. Descarga la carpeta completa del repositorio.
  pause
  exit /b 1
)
set "REINSTALAR="
if not exist "node_modules" set "REINSTALAR=1"
if exist "node_modules" if not exist "node_modules\.package-lock.json" set "REINSTALAR=1"
if defined REINSTALAR (
  echo.
  echo Instalando librerias. Solo pasa la primera vez y puede tardar unos minutos...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de librerias. Revisa tu conexion a internet.
    pause
    exit /b 1
  )
)
set "COMP=Prueba"
if not "%~1"=="" set "COMP=%~1"
if not exist "out" mkdir "out"
for /f %%t in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmm"') do set "TS=%%t"
set "SALIDA=out\%COMP%_%TS%.mp4"
echo.
echo Renderizando la composicion "%COMP%" con la tarjeta grafica (ANGLE)...
echo La primera vez Remotion descarga su navegador; necesita internet.
echo.
call npx remotion render src/index.ts %COMP% "%SALIDA%" --gl=angle --codec=h264 --crf=16 --timeout=240000
if errorlevel 1 (
  echo.
  echo [ERROR] El render fallo. Copia el mensaje de arriba y envialo a Claude.
  pause
  exit /b 1
)
echo.
echo ==============================================
echo   LISTO. Video guardado en:
echo   %CD%\%SALIDA%
echo ==============================================
pause
