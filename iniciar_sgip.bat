@echo off
title SGIP - Sistema de Gestion de Iniciativas y Proyectos
color 0A

echo ============================================================
echo    SGIP - Sistema de Gestion de Iniciativas y Proyectos
echo ============================================================
echo.

REM Guardar el directorio del script
set "SCRIPT_DIR=%~dp0"

REM Configurar Python en el PATH
set "PATH=C:\Users\ltolorzar\AppData\Local\Programs\Python\Python314;C:\Users\ltolorzar\AppData\Local\Programs\Python\Python314\Scripts;%PATH%"

echo [1/4] Verificando Python...
python --version
if errorlevel 1 (
    echo ERROR: Python no encontrado. Verifique la instalacion.
    pause
    exit /b 1
)

echo.
echo [2/4] Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no encontrado. Verifique la instalacion.
    pause
    exit /b 1
)

echo.
echo [3/4] Iniciando Backend (FastAPI)...
start "SGIP Backend" cmd /k "set "PATH=C:\Users\ltolorzar\AppData\Local\Programs\Python\Python314;C:\Users\ltolorzar\AppData\Local\Programs\Python\Python314\Scripts;%PATH%" && cd /d "%SCRIPT_DIR%backend" && echo Directorio: %CD% && echo Instalando dependencias... && python -m pip install -r requirements.txt && echo. && echo Iniciando servidor... && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Esperar a que el backend se inicie
echo Esperando que el backend inicie (15 segundos)...
timeout /t 15 /nobreak > nul

echo.
echo [4/4] Iniciando Frontend (React)...
start "SGIP Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && echo Directorio: %CD% && echo Instalando dependencias... && call npm install && echo. && echo Iniciando servidor... && call npm run dev"

echo.
echo ============================================================
echo    Servidores iniciandose:
echo    - Backend:  http://localhost:8000
echo    - API Docs: http://localhost:8000/docs
echo    - Frontend: http://localhost:8080
echo ============================================================
echo.
echo Esperando 30 segundos para abrir el navegador...
timeout /t 30 /nobreak > nul

start http://localhost:8080

echo.
echo Para detener los servidores, cierre las ventanas de comandos.
echo.
pause
