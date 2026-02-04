@echo off
title SGIP - Configuracion Base de Datos
color 0E

REM Configurar Python en el PATH
set "PATH=C:\Users\ltolorzar\AppData\Local\Programs\Python\Python314;C:\Users\ltolorzar\AppData\Local\Programs\Python\Python314\Scripts;%PATH%"

echo ============================================================
echo    SGIP - Configuracion de Base de Datos SQLite
echo ============================================================
echo.

REM Cambiar al directorio del backend
cd /d "%~dp0backend"

echo Directorio: %CD%
echo.

echo Instalando dependencias...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: No se pudieron instalar las dependencias.
    pause
    exit /b 1
)

echo.
echo Creando base de datos y usuario administrador...
python -c "from app.database import SessionLocal, engine, Base; from app.models.usuario import Usuario, RolUsuario, Area; from app.utils.security import get_password_hash; Base.metadata.create_all(bind=engine); db = SessionLocal(); area = db.query(Area).filter(Area.codigo == 'TD').first(); area = area if area else (db.add(Area(nombre='Transformacion Digital', codigo='TD', descripcion='Area de Transformacion Digital')), db.commit(), db.query(Area).filter(Area.codigo == 'TD').first())[-1]; admin = db.query(Usuario).filter(Usuario.email == 'admin@sgip.cl').first(); admin = admin if admin else (db.add(Usuario(email='admin@sgip.cl', hashed_password=get_password_hash('admin123'), nombre='Administrador', apellido='Sistema', rol=RolUsuario.ADMINISTRADOR, area_id=area.id)), db.commit(), print('Usuario administrador creado.'))[-1]; db.close(); print('Base de datos configurada correctamente.')"

echo.
echo ============================================================
echo    Configuracion completada!
echo.
echo    Credenciales del administrador:
echo    Email: admin@sgip.cl
echo    Password: admin123
echo.
echo    IMPORTANTE: Cambie la contrasena despues del primer login.
echo ============================================================
echo.
pause
