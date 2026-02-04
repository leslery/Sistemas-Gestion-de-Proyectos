from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..database import get_db
from ..models.usuario import Usuario
from ..schemas.usuario import Token, Usuario as UsuarioSchema, UsuarioCreate
from ..utils.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user
)
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Iniciar sesión y obtener token JWT"""
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    # Actualizar último acceso
    user.ultimo_acceso = datetime.utcnow()
    db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "rol": user.rol.value},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/registro", response_model=UsuarioSchema)
async def registro(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """Registrar un nuevo usuario"""
    # Verificar si el email ya existe
    if db.query(Usuario).filter(Usuario.email == usuario.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Crear usuario
    db_user = Usuario(
        email=usuario.email,
        hashed_password=get_password_hash(usuario.password),
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        rol=usuario.rol,
        area_id=usuario.area_id,
        telefono=usuario.telefono,
        cargo=usuario.cargo
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.get("/me", response_model=UsuarioSchema)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return current_user


from pydantic import BaseModel

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.put("/cambiar-password")
async def cambiar_password(
    data: ChangePasswordRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cambiar contraseña del usuario actual"""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )

    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente"}
