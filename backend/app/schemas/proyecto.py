from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from ..models.proyecto import (
    EstadoProyecto, EstadoFase, SemaforoSalud, NivelRiesgo,
    SeveridadIssue, TipoBitacora
)
from ..models.presupuesto import TipoOpex, TipoCambioPresupuesto, EstadoCambio, ClasificacionNIIF


# FaseProyecto schemas
class FaseProyectoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    orden: int = 1
    fecha_inicio_planificada: Optional[datetime] = None
    fecha_fin_planificada: Optional[datetime] = None


class FaseProyectoCreate(FaseProyectoBase):
    proyecto_id: int
    responsable_id: Optional[int] = None


class FaseProyectoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    orden: Optional[int] = None
    fecha_inicio_planificada: Optional[datetime] = None
    fecha_fin_planificada: Optional[datetime] = None
    fecha_inicio_real: Optional[datetime] = None
    fecha_fin_real: Optional[datetime] = None
    avance_porcentaje: Optional[int] = None
    estado: Optional[EstadoFase] = None
    responsable_id: Optional[int] = None


class FaseProyecto(FaseProyectoBase):
    id: int
    proyecto_id: int
    fecha_inicio_real: Optional[datetime] = None
    fecha_fin_real: Optional[datetime] = None
    avance_porcentaje: int
    estado: EstadoFase
    responsable_id: Optional[int] = None

    class Config:
        from_attributes = True


# HitoProyecto schemas
class HitoProyectoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_planificada: datetime


class HitoProyectoCreate(HitoProyectoBase):
    proyecto_id: int
    fase_id: Optional[int] = None


class HitoProyecto(HitoProyectoBase):
    id: int
    proyecto_id: int
    fase_id: Optional[int] = None
    fecha_real: Optional[datetime] = None
    completado: bool
    evidencia_url: Optional[str] = None

    class Config:
        from_attributes = True


# RiesgoProyecto schemas
class RiesgoProyectoBase(BaseModel):
    descripcion: str
    probabilidad: NivelRiesgo = NivelRiesgo.MEDIO
    impacto: NivelRiesgo = NivelRiesgo.MEDIO
    mitigacion: Optional[str] = None
    plan_contingencia: Optional[str] = None


class RiesgoProyectoCreate(RiesgoProyectoBase):
    proyecto_id: int
    responsable_id: Optional[int] = None


class RiesgoProyecto(RiesgoProyectoBase):
    id: int
    proyecto_id: int
    estado: str
    responsable_id: Optional[int] = None
    fecha_identificacion: datetime
    fecha_cierre: Optional[datetime] = None

    class Config:
        from_attributes = True


# IssueProyecto schemas
class IssueProyectoBase(BaseModel):
    titulo: str
    descripcion: str
    severidad: SeveridadIssue = SeveridadIssue.MEDIA


class IssueProyectoCreate(IssueProyectoBase):
    proyecto_id: int
    responsable_id: Optional[int] = None


class IssueProyecto(IssueProyectoBase):
    id: int
    proyecto_id: int
    estado: str
    responsable_id: Optional[int] = None
    resolucion: Optional[str] = None
    fecha_creacion: datetime
    fecha_resolucion: Optional[datetime] = None

    class Config:
        from_attributes = True


# BitacoraProyecto schemas
class BitacoraProyectoBase(BaseModel):
    tipo: TipoBitacora = TipoBitacora.NOTA
    descripcion: str


class BitacoraProyectoCreate(BitacoraProyectoBase):
    proyecto_id: int


class BitacoraProyecto(BitacoraProyectoBase):
    id: int
    proyecto_id: int
    usuario_id: int
    fecha: datetime
    usuario_nombre: Optional[str] = None

    class Config:
        from_attributes = True


# EjecucionMensual schemas
class EjecucionMensualBase(BaseModel):
    año: int
    mes: int
    capex_planificado: Decimal = 0
    capex_ejecutado: Decimal = 0
    avance_planificado: int = 0
    avance_real: int = 0
    comentarios: Optional[str] = None


class EjecucionMensualCreate(EjecucionMensualBase):
    proyecto_id: int


class EjecucionMensual(EjecucionMensualBase):
    id: int
    proyecto_id: int

    class Config:
        from_attributes = True


# Presupuesto schemas
class PresupuestoProyectoBase(BaseModel):
    capex_aprobado: Decimal = 0
    capex_comprometido: Decimal = 0
    capex_ejecutado: Decimal = 0
    opex_proyectado_anual: Decimal = 0
    opex_tipo: TipoOpex = TipoOpex.OTRO
    opex_descripcion: Optional[str] = None


class PresupuestoProyectoCreate(PresupuestoProyectoBase):
    proyecto_id: int


class PresupuestoProyecto(PresupuestoProyectoBase):
    id: int
    proyecto_id: int
    fecha_aprobacion: Optional[datetime] = None
    aprobado_por: Optional[int] = None

    class Config:
        from_attributes = True


# CambioPresupuesto schemas
class CambioPresupuestoBase(BaseModel):
    tipo: TipoCambioPresupuesto
    monto_solicitado: Decimal
    justificacion: str


class CambioPresupuestoCreate(CambioPresupuestoBase):
    proyecto_id: int


class CambioPresupuesto(CambioPresupuestoBase):
    id: int
    proyecto_id: int
    monto_aprobado: Optional[Decimal] = None
    estado: EstadoCambio
    solicitado_por: int
    aprobado_por: Optional[int] = None
    fecha_solicitud: datetime
    fecha_resolucion: Optional[datetime] = None
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True


# ClasificacionFinanciera schemas
class ClasificacionFinancieraBase(BaseModel):
    tipo_gasto: str
    descripcion: Optional[str] = None
    clasificacion_niif: ClasificacionNIIF
    monto: Decimal
    justificacion: Optional[str] = None


class ClasificacionFinancieraCreate(ClasificacionFinancieraBase):
    proyecto_id: int


class ClasificacionFinanciera(ClasificacionFinancieraBase):
    id: int
    proyecto_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Proyecto schemas
class ProyectoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class ProyectoCreate(ProyectoBase):
    iniciativa_id: int


class ProyectoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[EstadoProyecto] = None
    año_plan: Optional[int] = None
    semaforo_salud: Optional[SemaforoSalud] = None
    presupuesto_asignado: Optional[Decimal] = None
    fecha_activacion: Optional[datetime] = None
    fecha_inicio_planificada: Optional[datetime] = None
    fecha_fin_planificada: Optional[datetime] = None
    fecha_inicio_real: Optional[datetime] = None
    fecha_fin_real: Optional[datetime] = None
    avance_porcentaje: Optional[int] = None
    responsable_id: Optional[int] = None
    lecciones_aprendidas: Optional[str] = None
    metricas_exito: Optional[str] = None


class Proyecto(ProyectoBase):
    id: int
    iniciativa_id: int
    codigo_proyecto: str
    estado: EstadoProyecto
    año_plan: Optional[int] = None
    semaforo_salud: SemaforoSalud
    presupuesto_asignado: Decimal
    fecha_activacion: Optional[datetime] = None
    fecha_inicio_planificada: Optional[datetime] = None
    fecha_fin_planificada: Optional[datetime] = None
    fecha_inicio_real: Optional[datetime] = None
    fecha_fin_real: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None
    avance_porcentaje: int
    responsable_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProyectoConDetalles(Proyecto):
    iniciativa_titulo: Optional[str] = None
    responsable_nombre: Optional[str] = None
    area_demandante_nombre: Optional[str] = None
    fases: List[FaseProyecto] = []
    presupuesto: Optional[PresupuestoProyecto] = None
    riesgos_abiertos: int = 0
    issues_abiertos: int = 0
