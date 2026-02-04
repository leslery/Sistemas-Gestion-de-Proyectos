@echo off
title SGIP - Frontend (React)
color 0D

REM Cambiar al directorio del frontend (usando %~dp0 para obtener la ruta del .bat)
cd /d "%~dp0frontend"

echo ============================================================
echo    SGIP - Frontend (React + Vite)
echo ============================================================
echo.
echo Directorio actual: %CD%
echo.

echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no encontrado
    pause
    exit /b 1
)

echo.
echo Verificando que existe package.json...
if not exist package.json (
    echo ERROR: No se encuentra package.json en %CD%
    pause
    exit /b 1
)

echo.
echo Instalando/actualizando dependencias...
call npm install

echo.
echo ============================================================
echo    Iniciando servidor en http://localhost:5173
echo ============================================================
echo.

call npm run dev

pause
