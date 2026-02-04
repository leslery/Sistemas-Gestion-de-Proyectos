@echo off
title SGIP - Backend (FastAPI)
color 0B

REM Configurar Python en el PATH
set "PATH=C:\Users\ltolorzar\AppData\Local\Programs\Python\Python314;C:\Users\ltolorzar\AppData\Local\Programs\Python\Python314\Scripts;%PATH%"

REM Cambiar al directorio del backend (usando %~dp0 para obtener la ruta del .bat)
cd /d "%~dp0backend"

echo ============================================================
echo    SGIP - Backend (FastAPI)
echo ============================================================
echo.
echo Directorio actual: %CD%
echo.

echo Verificando Python...
python --version
if errorlevel 1 (
    echo ERROR: Python no encontrado
    pause
    exit /b 1
)

echo.
echo Verificando que existe requirements.txt...
if not exist requirements.txt (
    echo ERROR: No se encuentra requirements.txt en %CD%
    pause
    exit /b 1
)

echo.
echo Instalando/actualizando dependencias...
python -m pip install -r requirements.txt

echo.
echo ============================================================
echo    Iniciando servidor en http://localhost:8000
echo    Documentacion API: http://localhost:8000/docs
echo ============================================================
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
