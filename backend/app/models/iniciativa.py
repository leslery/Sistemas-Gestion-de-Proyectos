from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Enum, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class EstadoIniciativa(str, enum.Enum):
    BORRADOR = "borrador"
    ENVIADA = "enviada"
    EN_REVISION = "en_revision"
    EN_EVALUACION = "en_evaluacion"
    APROBADA = "aprobada"
    RECHAZADA = "rechazada"
    EN_BANCO_RESERVA = "en_banco_reserva"
    EN_PLAN_ANUAL = "en_plan_anual"
    ACTIVADA = "activada"


class ClasificacionInversion(str, enum.Enum):
    ESTANDAR_A = "estandar_a"  # < 300M, sin transformación
    ESTANDAR_B = "estandar_b"  # < 300M, con transformación
    ALTA_A = "alta_a"  # 300M - 1500M, < 25% transformación
    ALTA_B = "alta_b"  # 300M - 1500M, 25-75% transformación
    ALTA_C = "alta_c"  # 300M - 1500M, > 75% transformación
    ESTRATEGICA = "estrategica"  # > 1500M


class TipoInforme(str, enum.Enum):
    V1 = "V1"  # Estándar
    V2 = "V2"  # Alta inversión
    V3 = "V3"  # Estratégica


class Prioridad(str, enum.Enum):
    P1 = "P1"  # 32-38 puntos
    P2 = "P2"  # 25-31 puntos
    P3 = "P3"  # 18-24 puntos
    P4 = "P4"  # 11-17 puntos
    P5 = "P5"  # 0-10 puntos


class Iniciativa(Base):
    __tablename__ = "iniciativas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    justificacion = Column(Text)
    beneficios_esperados = Column(Text)
    area_demandante_id = Column(Integer, ForeignKey("areas.id"), nullable=False)

    # Estimaciones
    monto_estimado = Column(Numeric(15, 2), default=0)
    porcentaje_transformacion = Column(Integer, default=0)  # 0-100

    # Clasificación
    clasificacion_inversion = Column(Enum(ClasificacionInversion))
    tipo_informe = Column(Enum(TipoInforme))
    prioridad = Column(Enum(Prioridad))
    puntaje_total = Column(Integer, default=0)

    # Estado y workflow
    estado = Column(Enum(EstadoIniciativa), default=EstadoIniciativa.BORRADOR)
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    fecha_aprobacion = Column(DateTime)

    # Urgencia
    urgencia = Column(String(20), default="normal")  # baja, normal, alta, critica
    fecha_limite = Column(DateTime)

    # Auditoría
    created_by = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    area_demandante = relationship("Area", back_populates="iniciativas")
    creador = relationship("Usuario", back_populates="iniciativas_creadas")
    scoring = relationship("ScoringIniciativa", back_populates="iniciativa", uselist=False)
    evaluaciones = relationship("EvaluacionComite", back_populates="iniciativa")
    proyecto = relationship("Proyecto", back_populates="iniciativa", uselist=False)
    historial_estados = relationship("HistorialEstadoIniciativa", back_populates="iniciativa", order_by="HistorialEstadoIniciativa.fecha")


class HistorialEstadoIniciativa(Base):
    """Registro de todos los cambios de estado de una iniciativa para trazabilidad"""
    __tablename__ = "historial_estado_iniciativas"

    id = Column(Integer, primary_key=True, index=True)
    iniciativa_id = Column(Integer, ForeignKey("iniciativas.id"), nullable=False)

    estado_anterior = Column(Enum(EstadoIniciativa), nullable=True)
    estado_nuevo = Column(Enum(EstadoIniciativa), nullable=False)

    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    comentario = Column(Text)

    fecha = Column(DateTime, default=datetime.utcnow)

    # Relationships
    iniciativa = relationship("Iniciativa", back_populates="historial_estados")
    usuario = relationship("Usuario", back_populates="cambios_estado_realizados")


class ScoringIniciativa(Base):
    __tablename__ = "scoring_iniciativas"

    id = Column(Integer, primary_key=True, index=True)
    iniciativa_id = Column(Integer, ForeignKey("iniciativas.id"), unique=True, nullable=False)

    # Dimensión A: Impacto Estratégico (0-12 pts)
    dim_a_focos = Column(Integer, default=0)  # 0-4 pts: Focos estratégicos
    dim_a_profundidad = Column(Integer, default=0)  # 0-8 pts: Profundidad del aporte

    # Dimensión B: Impacto Operacional (0-10 pts)
    dim_b_beneficio = Column(Integer, default=0)  # 0-6 pts: Tipo de beneficio
    dim_b_alcance = Column(Integer, default=0)  # 0-4 pts: Alcance organizacional

    # Dimensión C: Urgencia y Viabilidad (0-16 pts)
    dim_c_urgencia = Column(Integer, default=0)  # 0-8 pts: Urgencia
    dim_c_viabilidad = Column(Integer, default=0)  # 0-8 pts: Viabilidad técnica

    # Totales calculados
    puntaje_total = Column(Integer, default=0)
    prioridad_calculada = Column(Enum(Prioridad))

    # Auditoría
    calculado_por = Column(Integer, ForeignKey("usuarios.id"))
    fecha_calculo = Column(DateTime, default=datetime.utcnow)

    # Relationships
    iniciativa = relationship("Iniciativa", back_populates="scoring")
