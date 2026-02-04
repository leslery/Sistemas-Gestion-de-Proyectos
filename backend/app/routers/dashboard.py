from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..models.usuario import Usuario, RolUsuario
from ..utils.security import get_current_user, check_role
from ..services.reportes import ReportesService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/ejecutivo")
async def obtener_dashboard_ejecutivo(
    año: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR
    ]))
):
    """Obtener dashboard ejecutivo completo"""
    return ReportesService.obtener_dashboard_ejecutivo(db, año)


@router.get("/kpis")
async def obtener_kpis(
    año: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener KPIs principales del portfolio"""
    return ReportesService.obtener_kpis_portfolio(db, año)


@router.get("/funnel")
async def obtener_funnel_iniciativas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener funnel de iniciativas"""
    return ReportesService.obtener_funnel_iniciativas(db)


@router.get("/salud")
async def obtener_dashboard_salud(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener dashboard de salud del portfolio"""
    kpis = ReportesService.obtener_kpis_portfolio(db)
    criticos = ReportesService.obtener_proyectos_criticos(db, limite=10)

    return {
        "semaforo": kpis["semaforo"],
        "proyectos_criticos": criticos,
        "fecha_generacion": datetime.utcnow().isoformat()
    }


@router.get("/financiero")
async def obtener_dashboard_financiero(
    año: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR
    ]))
):
    """Obtener dashboard financiero"""
    año_actual = año or datetime.now().year

    kpis = ReportesService.obtener_kpis_portfolio(db, año_actual)
    ejecucion = ReportesService.obtener_ejecucion_presupuestaria(db, año_actual)

    return {
        "año": año_actual,
        "presupuesto": kpis["presupuesto"],
        "ejecucion_mensual": ejecucion["datos"],
        "total_planificado": ejecucion["total_planificado"],
        "total_ejecutado": ejecucion["total_ejecutado"],
        "porcentaje_ejecucion": ejecucion["porcentaje_ejecucion"],
        "fecha_generacion": datetime.utcnow().isoformat()
    }


@router.get("/banco-reserva")
async def obtener_dashboard_banco_reserva(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener estadísticas del banco de reserva"""
    return ReportesService.obtener_banco_reserva_stats(db)


@router.get("/clasificacion")
async def obtener_dashboard_clasificacion(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener distribución por clasificación de inversión"""
    return ReportesService.obtener_distribucion_clasificacion(db)


@router.get("/por-rol")
async def obtener_dashboard_por_rol(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener dashboard personalizado según el rol del usuario"""
    from ..models.iniciativa import Iniciativa, EstadoIniciativa
    from ..models.proyecto import Proyecto, EstadoProyecto
    from ..models.evaluacion import EvaluacionComite

    rol = current_user.rol
    dashboard = {
        "rol": rol.value,
        "usuario": current_user.nombre_completo
    }

    if rol == RolUsuario.DEMANDANTE:
        # Mis iniciativas
        mis_iniciativas = db.query(Iniciativa).filter(
            Iniciativa.created_by == current_user.id
        ).all()

        dashboard["mis_iniciativas"] = {
            "total": len(mis_iniciativas),
            "borradores": sum(1 for i in mis_iniciativas if i.estado == EstadoIniciativa.BORRADOR),
            "en_proceso": sum(1 for i in mis_iniciativas if i.estado in [
                EstadoIniciativa.ENVIADA, EstadoIniciativa.EN_REVISION, EstadoIniciativa.EN_EVALUACION
            ]),
            "aprobadas": sum(1 for i in mis_iniciativas if i.estado == EstadoIniciativa.APROBADA)
        }

    elif rol in [RolUsuario.ANALISTA_TD, RolUsuario.JEFE_TD]:
        # Iniciativas pendientes de revisión
        pendientes_revision = db.query(Iniciativa).filter(
            Iniciativa.estado == EstadoIniciativa.ENVIADA
        ).count()

        pendientes_evaluacion = db.query(Iniciativa).filter(
            Iniciativa.estado == EstadoIniciativa.EN_EVALUACION
        ).count()

        proyectos_activos = db.query(Proyecto).filter(
            Proyecto.estado == EstadoProyecto.EN_EJECUCION
        ).count()

        dashboard["pendientes_revision"] = pendientes_revision
        dashboard["pendientes_evaluacion"] = pendientes_evaluacion
        dashboard["proyectos_activos"] = proyectos_activos
        dashboard["kpis"] = ReportesService.obtener_kpis_portfolio(db)

    elif rol == RolUsuario.COMITE_EXPERTOS:
        # Evaluaciones pendientes
        pendientes = db.query(Iniciativa).filter(
            Iniciativa.estado == EstadoIniciativa.EN_EVALUACION
        ).all()

        # Filtrar las que ya evaluó
        evaluadas_ids = db.query(EvaluacionComite.iniciativa_id).filter(
            EvaluacionComite.evaluador_id == current_user.id
        ).all()
        evaluadas_ids = [e[0] for e in evaluadas_ids]

        dashboard["evaluaciones_pendientes"] = sum(
            1 for p in pendientes if p.id not in evaluadas_ids
        )
        dashboard["evaluaciones_realizadas"] = len(evaluadas_ids)

    elif rol in [RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]:
        # Dashboard ejecutivo completo
        dashboard["ejecutivo"] = ReportesService.obtener_dashboard_ejecutivo(db)

    return dashboard
