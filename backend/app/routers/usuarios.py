from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.usuario import Usuario, Area, RolUsuario
from ..schemas.usuario import (
    Usuario as UsuarioSchema, UsuarioCreate, UsuarioUpdate,
    Area as AreaSchema, AreaCreate, AreaUpdate
)
from ..utils.security import get_current_user, get_password_hash, check_role

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


# ============== USUARIOS ==============

@router.get("/", response_model=List[UsuarioSchema])
async def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    rol: Optional[RolUsuario] = None,
    area_id: Optional[int] = None,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.ADMINISTRADOR, RolUsuario.JEFE_TD]))
):
    """Listar usuarios con filtros"""
    query = db.query(Usuario)

    if rol:
        query = query.filter(Usuario.rol == rol)
    if area_id:
        query = query.filter(Usuario.area_id == area_id)
    if activo is not None:
        query = query.filter(Usuario.activo == activo)

    return query.offset(skip).limit(limit).all()


@router.get("/{usuario_id}", response_model=UsuarioSchema)
async def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener un usuario por ID"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post("/", response_model=UsuarioSchema)
async def crear_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.ADMINISTRADOR]))
):
    """Crear un nuevo usuario"""
    if db.query(Usuario).filter(Usuario.email == usuario.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

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


@router.put("/{usuario_id}", response_model=UsuarioSchema)
async def actualizar_usuario(
    usuario_id: int,
    usuario: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.ADMINISTRADOR]))
):
    """Actualizar un usuario"""
    db_user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = usuario.model_dump(exclude_unset=True)

    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{usuario_id}")
async def desactivar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.ADMINISTRADOR]))
):
    """Desactivar un usuario (soft delete)"""
    db_user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db_user.activo = False
    db.commit()
    return {"mensaje": "Usuario desactivado correctamente"}


# ============== ÁREAS ==============

@router.get("/areas/", response_model=List[AreaSchema])
async def listar_areas(
    skip: int = 0,
    limit: int = 100,
    activa: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar áreas"""
    query = db.query(Area)
    if activa is not None:
        query = query.filter(Area.activa == activa)
    return query.offset(skip).limit(limit).all()


@router.get("/areas/{area_id}", response_model=AreaSchema)
async def obtener_area(
    area_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener un área por ID"""
    area = db.query(Area).filter(Area.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    return area


@router.post("/areas/", response_model=AreaSchema)
async def crear_area(
    area: AreaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.ADMINISTRADOR]))
):
    """Crear una nueva área"""
    if db.query(Area).filter(Area.codigo == area.codigo).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de área ya existe"
        )

    db_area = Area(**area.model_dump())
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area


@router.put("/areas/{area_id}", response_model=AreaSchema)
async def actualizar_area(
    area_id: int,
    area: AreaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.ADMINISTRADOR]))
):
    """Actualizar un área"""
    db_area = db.query(Area).filter(Area.id == area_id).first()
    if not db_area:
        raise HTTPException(status_code=404, detail="Área no encontrada")

    update_data = area.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_area, key, value)

    db.commit()
    db.refresh(db_area)
    return db_area
