from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base


class EvaluacionComite(Base):
    __tablename__ = "evaluaciones_comite"

    id = Column(Integer, primary_key=True, index=True)
    iniciativa_id = Column(Integer, ForeignKey("iniciativas.id"), nullable=False)
    evaluador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Dimensión 1: Justificación y Beneficios (35%)
    dim1_claridad_problema = Column(Numeric(5, 2), default=0)  # 0-10
    dim1_beneficios_cuantificados = Column(Numeric(5, 2), default=0)  # 0-15
    dim1_alineacion_estrategica = Column(Numeric(5, 2), default=0)  # 0-10
    dim1_subtotal = Column(Numeric(5, 2), default=0)  # 0-35

    # Dimensión 2: Solución Técnica (40%)
    dim2_arquitectura = Column(Numeric(5, 2), default=0)  # 0-15
    dim2_integracion = Column(Numeric(5, 2), default=0)  # 0-10
    dim2_seguridad = Column(Numeric(5, 2), default=0)  # 0-10
    dim2_escalabilidad = Column(Numeric(5, 2), default=0)  # 0-5
    dim2_subtotal = Column(Numeric(5, 2), default=0)  # 0-40

    # Dimensión 3: Análisis Económico (25%)
    dim3_presupuesto_detallado = Column(Numeric(5, 2), default=0)  # 0-10
    dim3_roi_tco = Column(Numeric(5, 2), default=0)  # 0-10
    dim3_riesgos_financieros = Column(Numeric(5, 2), default=0)  # 0-5
    dim3_subtotal = Column(Numeric(5, 2), default=0)  # 0-25

    # Resultado
    puntaje_total = Column(Numeric(5, 2), default=0)  # 0-100
    aprobado = Column(Boolean, default=False)  # >= 80 puntos

    # Sistema de veto
    veto = Column(Boolean, default=False)
    motivo_veto = Column(Text)  # Falla crítica identificada

    # Observaciones
    observaciones = Column(Text)
    recomendaciones = Column(Text)

    # Fechas
    fecha_evaluacion = Column(DateTime, default=datetime.utcnow)
    fecha_revision = Column(DateTime)  # Si hubo re-evaluación

    # Relationships
    iniciativa = relationship("Iniciativa", back_populates="evaluaciones")
    evaluador = relationship("Usuario", back_populates="evaluaciones")
