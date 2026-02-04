from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from ..database import get_db
from ..models.usuario import Usuario, RolUsuario
from ..models.presupuesto import (
    PresupuestoProyecto, CambioPresupuesto, ClasificacionFinanciera,
    TipoCambioPresupuesto, EstadoCambio
)
from ..schemas.proyecto import (
    PresupuestoProyecto as PresupuestoSchema, PresupuestoProyectoCreate,
    CambioPresupuesto as CambioSchema, CambioPresupuestoCreate,
    ClasificacionFinanciera as ClasificacionSchema, ClasificacionFinancieraCreate
)
from ..utils.security import get_current_user, check_role
from ..services.presupuesto import PresupuestoService
from ..services.clasificacion import ClasificacionService

router = APIRouter(prefix="/api/presupuesto", tags=["Presupuesto"])


# ============== PRESUPUESTO DE PROYECTO ==============

@router.get("/proyecto/{proyecto_id}", response_model=PresupuestoSchema)
async def obtener_presupuesto_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener presupuesto de un proyecto"""
    presupuesto = db.query(PresupuestoProyecto).filter(
        PresupuestoProyecto.proyecto_id == proyecto_id
    ).first()

    if not presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")

    return presupuesto


@router.post("/proyecto/{proyecto_id}", response_model=PresupuestoSchema)
async def crear_presupuesto_proyecto(
    proyecto_id: int,
    presupuesto: PresupuestoProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.ANALISTA_TD, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Crear o actualizar presupuesto de un proyecto"""
    existente = db.query(PresupuestoProyecto).filter(
        PresupuestoProyecto.proyecto_id == proyecto_id
    ).first()

    if existente:
        # Actualizar
        for key, value in presupuesto.model_dump(exclude={'proyecto_id'}).items():
            setattr(existente, key, value)
        db.commit()
        db.refresh(existente)
        return existente
    else:
        # Crear nuevo
        return PresupuestoService.crear_presupuesto_proyecto(
            db=db,
            proyecto_id=proyecto_id,
            capex_aprobado=presupuesto.capex_aprobado,
            opex_proyectado=presupuesto.opex_proyectado_anual,
            aprobado_por=current_user.id
        )


# ============== CAMBIOS DE PRESUPUESTO ==============

@router.get("/cambios/pendientes", response_model=List[dict])
async def listar_cambios_pendientes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR
    ]))
):
    """Listar solicitudes de cambio de presupuesto pendientes"""
    from ..models.proyecto import Proyecto

    cambios = db.query(CambioPresupuesto).filter(
        CambioPresupuesto.estado == EstadoCambio.PENDIENTE
    ).all()

    resultado = []
    for c in cambios:
        proyecto = db.query(Proyecto).filter(Proyecto.id == c.proyecto_id).first()
        resultado.append({
            "id": c.id,
            "proyecto_id": c.proyecto_id,
            "proyecto_codigo": proyecto.codigo_proyecto if proyecto else None,
            "proyecto_nombre": proyecto.nombre if proyecto else None,
            "tipo": c.tipo.value,
            "monto_solicitado": float(c.monto_solicitado),
            "justificacion": c.justificacion,
            "fecha_solicitud": c.fecha_solicitud
        })

    return resultado


@router.get("/cambios/proyecto/{proyecto_id}", response_model=List[CambioSchema])
async def listar_cambios_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar historial de cambios de presupuesto de un proyecto"""
    return db.query(CambioPresupuesto).filter(
        CambioPresupuesto.proyecto_id == proyecto_id
    ).order_by(CambioPresupuesto.fecha_solicitud.desc()).all()


@router.post("/cambios", response_model=CambioSchema)
async def solicitar_cambio_presupuesto(
    cambio: CambioPresupuestoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Solicitar un cambio de presupuesto"""
    return PresupuestoService.solicitar_cambio_presupuesto(
        db=db,
        proyecto_id=cambio.proyecto_id,
        tipo=cambio.tipo,
        monto_solicitado=cambio.monto_solicitado,
        justificacion=cambio.justificacion,
        solicitado_por=current_user.id
    )


@router.post("/cambios/{cambio_id}/aprobar")
async def aprobar_cambio(
    cambio_id: int,
    monto_aprobado: float,
    observaciones: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR
    ]))
):
    """Aprobar una solicitud de cambio de presupuesto"""
    cambio = PresupuestoService.aprobar_cambio_presupuesto(
        db=db,
        cambio_id=cambio_id,
        monto_aprobado=Decimal(str(monto_aprobado)),
        aprobado_por=current_user.id,
        observaciones=observaciones
    )
    return {"mensaje": "Cambio de presupuesto aprobado", "cambio_id": cambio.id}


@router.post("/cambios/{cambio_id}/rechazar")
async def rechazar_cambio(
    cambio_id: int,
    observaciones: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR
    ]))
):
    """Rechazar una solicitud de cambio de presupuesto"""
    cambio = PresupuestoService.rechazar_cambio_presupuesto(
        db=db,
        cambio_id=cambio_id,
        aprobado_por=current_user.id,
        observaciones=observaciones
    )
    return {"mensaje": "Cambio de presupuesto rechazado", "cambio_id": cambio.id}


# ============== CLASIFICACIÓN FINANCIERA ==============

@router.get("/clasificacion/proyecto/{proyecto_id}", response_model=List[ClasificacionSchema])
async def obtener_clasificacion_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener clasificaciones financieras de un proyecto"""
    return db.query(ClasificacionFinanciera).filter(
        ClasificacionFinanciera.proyecto_id == proyecto_id
    ).all()


@router.post("/clasificacion/proyecto/{proyecto_id}")
async def clasificar_gastos_proyecto(
    proyecto_id: int,
    gastos: List[dict],
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.ANALISTA_TD, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Clasificar gastos de un proyecto según NIIF"""
    resultado = ClasificacionService.clasificar_proyecto(
        db=db,
        proyecto_id=proyecto_id,
        gastos=gastos
    )

    return {
        "mensaje": "Gastos clasificados correctamente",
        "resumen": resultado["resumen"],
        "total_capex": resultado["total_capex"],
        "total_derecho_uso": resultado["total_derecho_uso"],
        "total_opex": resultado["total_opex"]
    }


# ============== ALERTAS ==============

@router.get("/alertas/proyecto/{proyecto_id}")
async def obtener_alertas_presupuesto(
    proyecto_id: int,
    umbral: float = 10.0,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener alertas de sobrecosto de un proyecto"""
    return PresupuestoService.verificar_alertas_sobrecosto(
        db=db,
        proyecto_id=proyecto_id,
        umbral_alerta=umbral
    )


# ============== CURVA S ==============

@router.get("/curva-s/proyecto/{proyecto_id}")
async def obtener_curva_s(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener datos de la curva S de un proyecto"""
    return PresupuestoService.obtener_curva_s(db=db, proyecto_id=proyecto_id)
