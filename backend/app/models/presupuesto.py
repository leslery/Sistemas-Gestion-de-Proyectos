from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class ClasificacionNIIF(str, enum.Enum):
    CAPEX_INTANGIBLE = "capex_intangible"  # NIC 38
    CAPEX_TANGIBLE = "capex_tangible"  # NIC 16
    DERECHO_USO = "derecho_uso"  # NIIF 16
    OPEX = "opex"  # NIC 1


class TipoOpex(str, enum.Enum):
    LICENCIAS = "licencias"
    SOPORTE = "soporte"
    MANTENIMIENTO = "mantenimiento"
    OTRO = "otro"


class TipoCambioPresupuesto(str, enum.Enum):
    AUMENTO = "aumento"
    REDUCCION = "reduccion"
    REASIGNACION = "reasignacion"


class EstadoCambio(str, enum.Enum):
    PENDIENTE = "pendiente"
    APROBADO = "aprobado"
    RECHAZADO = "rechazado"


class PresupuestoProyecto(Base):
    __tablename__ = "presupuesto_proyecto"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), unique=True, nullable=False)

    # CAPEX
    capex_aprobado = Column(Numeric(15, 2), default=0)
    capex_comprometido = Column(Numeric(15, 2), default=0)
    capex_ejecutado = Column(Numeric(15, 2), default=0)

    # OPEX proyectado
    opex_proyectado_anual = Column(Numeric(15, 2), default=0)
    opex_tipo = Column(Enum(TipoOpex), default=TipoOpex.OTRO)
    opex_descripcion = Column(Text)

    # Aprobación
    fecha_aprobacion = Column(DateTime)
    aprobado_por = Column(Integer, ForeignKey("usuarios.id"))

    # Auditoría
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    proyecto = relationship("Proyecto", back_populates="presupuesto")


class CambioPresupuesto(Base):
    __tablename__ = "cambios_presupuesto"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)

    # Tipo de cambio
    tipo = Column(Enum(TipoCambioPresupuesto), nullable=False)

    # Montos
    monto_solicitado = Column(Numeric(15, 2), nullable=False)
    monto_aprobado = Column(Numeric(15, 2))

    # Justificación
    justificacion = Column(Text, nullable=False)

    # Estado
    estado = Column(Enum(EstadoCambio), default=EstadoCambio.PENDIENTE)

    # Workflow
    solicitado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    aprobado_por = Column(Integer, ForeignKey("usuarios.id"))

    # Fechas
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    fecha_resolucion = Column(DateTime)

    # Observaciones
    observaciones = Column(Text)

    # Relationships
    proyecto = relationship("Proyecto", back_populates="cambios_presupuesto")


class ClasificacionFinanciera(Base):
    __tablename__ = "clasificacion_financiera"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)

    # Tipo de gasto
    tipo_gasto = Column(String(100), nullable=False)
    descripcion = Column(Text)

    # Clasificación NIIF
    clasificacion_niif = Column(Enum(ClasificacionNIIF), nullable=False)

    # Monto
    monto = Column(Numeric(15, 2), nullable=False)

    # Justificación de clasificación
    justificacion = Column(Text)

    # Auditoría
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    proyecto = relationship("Proyecto", back_populates="clasificaciones_financieras")
