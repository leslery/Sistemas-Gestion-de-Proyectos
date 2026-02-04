from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class EvaluacionComiteBase(BaseModel):
    # Dimensión 1: Justificación y Beneficios (35%)
    dim1_claridad_problema: Decimal = 0
    dim1_beneficios_cuantificados: Decimal = 0
    dim1_alineacion_estrategica: Decimal = 0

    # Dimensión 2: Solución Técnica (40%)
    dim2_arquitectura: Decimal = 0
    dim2_integracion: Decimal = 0
    dim2_seguridad: Decimal = 0
    dim2_escalabilidad: Decimal = 0

    # Dimensión 3: Análisis Económico (25%)
    dim3_presupuesto_detallado: Decimal = 0
    dim3_roi_tco: Decimal = 0
    dim3_riesgos_financieros: Decimal = 0

    # Veto
    veto: bool = False
    motivo_veto: Optional[str] = None

    # Observaciones
    observaciones: Optional[str] = None
    recomendaciones: Optional[str] = None


class EvaluacionComiteCreate(EvaluacionComiteBase):
    iniciativa_id: int


class EvaluacionComiteUpdate(BaseModel):
    dim1_claridad_problema: Optional[Decimal] = None
    dim1_beneficios_cuantificados: Optional[Decimal] = None
    dim1_alineacion_estrategica: Optional[Decimal] = None
    dim2_arquitectura: Optional[Decimal] = None
    dim2_integracion: Optional[Decimal] = None
    dim2_seguridad: Optional[Decimal] = None
    dim2_escalabilidad: Optional[Decimal] = None
    dim3_presupuesto_detallado: Optional[Decimal] = None
    dim3_roi_tco: Optional[Decimal] = None
    dim3_riesgos_financieros: Optional[Decimal] = None
    veto: Optional[bool] = None
    motivo_veto: Optional[str] = None
    observaciones: Optional[str] = None
    recomendaciones: Optional[str] = None


class EvaluacionComite(EvaluacionComiteBase):
    id: int
    iniciativa_id: int
    evaluador_id: int
    dim1_subtotal: Decimal
    dim2_subtotal: Decimal
    dim3_subtotal: Decimal
    puntaje_total: Decimal
    aprobado: bool
    fecha_evaluacion: datetime
    fecha_revision: Optional[datetime] = None
    evaluador_nombre: Optional[str] = None

    class Config:
        from_attributes = True
