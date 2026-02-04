from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class RolUsuario(str, enum.Enum):
    DEMANDANTE = "demandante"
    ANALISTA_TD = "analista_td"
    JEFE_TD = "jefe_td"
    COMITE_EXPERTOS = "comite_expertos"
    CGEDX = "cgedx"
    ADMINISTRADOR = "administrador"


class Area(Base):
    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    codigo = Column(String(20), unique=True, nullable=False)
    descripcion = Column(String(500))
    activa = Column(Boolean, default=True)
    responsable_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    responsable = relationship("Usuario", back_populates="area_responsable", foreign_keys=[responsable_id])
    usuarios = relationship("Usuario", back_populates="area", foreign_keys="Usuario.area_id")
    iniciativas = relationship("Iniciativa", back_populates="area_demandante")


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    rol = Column(Enum(RolUsuario), nullable=False, default=RolUsuario.DEMANDANTE)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)
    telefono = Column(String(20))
    cargo = Column(String(100))
    activo = Column(Boolean, default=True)
    ultimo_acceso = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    area = relationship("Area", back_populates="usuarios", foreign_keys=[area_id])
    area_responsable = relationship("Area", back_populates="responsable", foreign_keys=[Area.responsable_id])
    iniciativas_creadas = relationship("Iniciativa", back_populates="creador")
    evaluaciones = relationship("EvaluacionComite", back_populates="evaluador")
    bitacora_entries = relationship("BitacoraProyecto", back_populates="usuario")
    cambios_estado_realizados = relationship("HistorialEstadoIniciativa", back_populates="usuario")

    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"
