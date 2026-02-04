from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from ..models.iniciativa import (
    EstadoIniciativa, ClasificacionInversion, TipoInforme, Prioridad
)


# Scoring schemas
class ScoringIniciativaBase(BaseModel):
    dim_a_focos: int = 0
    dim_a_profundidad: int = 0
    dim_b_beneficio: int = 0
    dim_b_alcance: int = 0
    dim_c_urgencia: int = 0
    dim_c_viabilidad: int = 0


class ScoringIniciativaCreate(ScoringIniciativaBase):
    iniciativa_id: int


class ScoringIniciativa(ScoringIniciativaBase):
    id: int
    iniciativa_id: int
    puntaje_total: int
    prioridad_calculada: Optional[Prioridad] = None
    fecha_calculo: datetime

    class Config:
        from_attributes = True


# Iniciativa schemas
class IniciativaBase(BaseModel):
    titulo: str
    descripcion: str
    justificacion: Optional[str] = None
    beneficios_esperados: Optional[str] = None
    area_demandante_id: int
    monto_estimado: Decimal = 0
    porcentaje_transformacion: int = 0
    urgencia: str = "normal"
    fecha_limite: Optional[datetime] = None


class IniciativaCreate(IniciativaBase):
    pass


class IniciativaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    justificacion: Optional[str] = None
    beneficios_esperados: Optional[str] = None
    area_demandante_id: Optional[int] = None
    monto_estimado: Optional[Decimal] = None
    porcentaje_transformacion: Optional[int] = None
    urgencia: Optional[str] = None
    fecha_limite: Optional[datetime] = None
    estado: Optional[EstadoIniciativa] = None


class IniciativaResumen(BaseModel):
    id: int
    codigo: str
    titulo: str
    estado: EstadoIniciativa
    prioridad: Optional[Prioridad] = None
    monto_estimado: Decimal
    clasificacion_inversion: Optional[ClasificacionInversion] = None
    fecha_solicitud: datetime
    area_demandante_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class Iniciativa(IniciativaBase):
    id: int
    codigo: str
    estado: EstadoIniciativa
    clasificacion_inversion: Optional[ClasificacionInversion] = None
    tipo_informe: Optional[TipoInforme] = None
    prioridad: Optional[Prioridad] = None
    puntaje_total: int
    fecha_solicitud: datetime
    fecha_aprobacion: Optional[datetime] = None
    created_by: int
    created_at: datetime
    updated_at: datetime
    scoring: Optional[ScoringIniciativa] = None

    class Config:
        from_attributes = True


class IniciativaConDetalles(Iniciativa):
    area_demandante_nombre: Optional[str] = None
    creador_nombre: Optional[str] = None
    evaluaciones_count: int = 0
    tiene_proyecto: bool = False


# Historial de estados
class HistorialEstadoBase(BaseModel):
    estado_anterior: Optional[EstadoIniciativa] = None
    estado_nuevo: EstadoIniciativa
    comentario: Optional[str] = None


class HistorialEstadoCreate(HistorialEstadoBase):
    iniciativa_id: int
    usuario_id: int


class HistorialEstado(HistorialEstadoBase):
    id: int
    iniciativa_id: int
    usuario_id: int
    fecha: datetime
    usuario_nombre: Optional[str] = None

    class Config:
        from_attributes = True


# Pipeline / Workflow
class IniciativaPipeline(BaseModel):
    id: int
    codigo: str
    titulo: str
    estado: EstadoIniciativa
    prioridad: Optional[Prioridad] = None
    monto_estimado: Decimal
    area_demandante_nombre: Optional[str] = None
    creador_nombre: Optional[str] = None
    fecha_solicitud: datetime
    dias_en_estado: int = 0
    urgencia: str = "normal"

    class Config:
        from_attributes = True


class PipelineStats(BaseModel):
    estado: str
    cantidad: int
    monto_total: Decimal
    porcentaje: float


class WorkflowMetrics(BaseModel):
    total_iniciativas: int
    por_estado: List[PipelineStats]
    tiempo_promedio_aprobacion: Optional[float] = None
    tasa_aprobacion: float = 0.0
    tasa_rechazo: float = 0.0
