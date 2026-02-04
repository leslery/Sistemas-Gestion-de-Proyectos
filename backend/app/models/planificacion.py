from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class EstadoPlan(str, enum.Enum):
    BORRADOR = "borrador"
    EN_REVISION = "en_revision"
    APROBADO = "aprobado"
    EN_EJECUCION = "en_ejecucion"
    CERRADO = "cerrado"


class PlanAnual(Base):
    __tablename__ = "plan_anual"

    id = Column(Integer, primary_key=True, index=True)
    año = Column(Integer, unique=True, nullable=False)
    nombre = Column(String(100))
    descripcion = Column(Text)

    # Presupuesto
    presupuesto_total = Column(Numeric(15, 2), default=0)
    presupuesto_comprometido = Column(Numeric(15, 2), default=0)
    presupuesto_ejecutado = Column(Numeric(15, 2), default=0)

    # Estado
    estado = Column(Enum(EstadoPlan), default=EstadoPlan.BORRADOR)

    # Aprobación
    aprobado_por = Column(Integer, ForeignKey("usuarios.id"))
    fecha_aprobacion = Column(DateTime)

    # Auditoría
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    proyectos = relationship("PlanAnualProyecto", back_populates="plan")


class PlanAnualProyecto(Base):
    __tablename__ = "plan_anual_proyectos"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plan_anual.id"), nullable=False)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)

    # Asignación
    monto_asignado = Column(Numeric(15, 2), default=0)
    orden_prioridad = Column(Integer, default=1)

    # Notas
    notas = Column(Text)

    # Fechas
    fecha_inclusion = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plan = relationship("PlanAnual", back_populates="proyectos")
    proyecto = relationship("Proyecto", back_populates="planes_anuales")
