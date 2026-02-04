from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models.usuario import RolUsuario


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


# Area schemas
class AreaBase(BaseModel):
    nombre: str
    codigo: str
    descripcion: Optional[str] = None


class AreaCreate(AreaBase):
    responsable_id: Optional[int] = None


class AreaUpdate(BaseModel):
    nombre: Optional[str] = None
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    responsable_id: Optional[int] = None
    activa: Optional[bool] = None


class Area(AreaBase):
    id: int
    activa: bool
    responsable_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Usuario schemas
class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str
    apellido: str
    rol: RolUsuario = RolUsuario.DEMANDANTE
    area_id: Optional[int] = None
    telefono: Optional[str] = None
    cargo: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    rol: Optional[RolUsuario] = None
    area_id: Optional[int] = None
    telefono: Optional[str] = None
    cargo: Optional[str] = None
    activo: Optional[bool] = None
    password: Optional[str] = None


class Usuario(UsuarioBase):
    id: int
    activo: bool
    ultimo_acceso: Optional[datetime] = None
    created_at: datetime
    area: Optional[Area] = None

    class Config:
        from_attributes = True


class UsuarioInDB(Usuario):
    hashed_password: str
