from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
from datetime import datetime

from ..database import get_db
from ..models.usuario import Usuario, RolUsuario
from ..models.proyecto import Proyecto, EjecucionMensual, SemaforoSalud, EstadoProyecto
from ..schemas.proyecto import EjecucionMensual as EjecucionSchema, EjecucionMensualCreate
from ..utils.security import get_current_user, check_role
from ..services.presupuesto import PresupuestoService

router = APIRouter(prefix="/api/seguimiento", tags=["Seguimiento"])


@router.post("/ejecucion", response_model=EjecucionSchema)
async def registrar_ejecucion_mensual(
    ejecucion: EjecucionMensualCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Registrar ejecución mensual de un proyecto (plan y consumo)"""
    return PresupuestoService.registrar_ejecucion(
        db=db,
        proyecto_id=ejecucion.proyecto_id,
        año=ejecucion.año,
        mes=ejecucion.mes,
        capex_ejecutado=ejecucion.capex_ejecutado,
        avance_real=ejecucion.avance_real,
        capex_planificado=ejecucion.capex_planificado,
        avance_planificado=ejecucion.avance_planificado,
        comentarios=ejecucion.comentarios
    )


@router.get("/ejecucion/proyecto/{proyecto_id}")
async def obtener_ejecucion_proyecto(
    proyecto_id: int,
    año: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener historial de ejecución mensual de un proyecto"""
    query = db.query(EjecucionMensual).filter(
        EjecucionMensual.proyecto_id == proyecto_id
    )

    if año:
        query = query.filter(EjecucionMensual.año == año)

    ejecuciones = query.order_by(EjecucionMensual.año, EjecucionMensual.mes).all()

    return [
        {
            "id": e.id,
            "año": e.año,
            "mes": e.mes,
            "periodo": f"{e.año}-{e.mes:02d}",
            "capex_planificado": float(e.capex_planificado or 0),
            "capex_ejecutado": float(e.capex_ejecutado or 0),
            "avance_planificado": e.avance_planificado,
            "avance_real": e.avance_real,
            "comentarios": e.comentarios
        }
        for e in ejecuciones
    ]


@router.put("/proyecto/{proyecto_id}/avance")
async def actualizar_avance_proyecto(
    proyecto_id: int,
    avance_porcentaje: int,
    comentario: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar el avance porcentual de un proyecto"""
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()

    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if proyecto.estado != EstadoProyecto.EN_EJECUCION:
        raise HTTPException(status_code=400, detail="Solo se puede actualizar proyectos en ejecución")

    if avance_porcentaje < 0 or avance_porcentaje > 100:
        raise HTTPException(status_code=400, detail="El avance debe estar entre 0 y 100")

    proyecto.avance_porcentaje = avance_porcentaje

    # Registrar en bitácora
    from ..models.proyecto import BitacoraProyecto, TipoBitacora
    bitacora = BitacoraProyecto(
        proyecto_id=proyecto_id,
        usuario_id=current_user.id,
        tipo=TipoBitacora.NOTA,
        descripcion=f"Avance actualizado a {avance_porcentaje}%. {comentario or ''}"
    )
    db.add(bitacora)

    db.commit()

    return {"mensaje": "Avance actualizado correctamente", "avance": avance_porcentaje}


@router.put("/proyecto/{proyecto_id}/semaforo")
async def actualizar_semaforo_proyecto(
    proyecto_id: int,
    semaforo: SemaforoSalud,
    justificacion: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.ANALISTA_TD, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Actualizar el semáforo de salud de un proyecto"""
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()

    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    semaforo_anterior = proyecto.semaforo_salud
    proyecto.semaforo_salud = semaforo

    # Registrar en bitácora
    from ..models.proyecto import BitacoraProyecto, TipoBitacora
    bitacora = BitacoraProyecto(
        proyecto_id=proyecto_id,
        usuario_id=current_user.id,
        tipo=TipoBitacora.CAMBIO,
        descripcion=f"Semáforo cambiado de {semaforo_anterior.value} a {semaforo.value}. Justificación: {justificacion}"
    )
    db.add(bitacora)

    db.commit()

    return {
        "mensaje": "Semáforo actualizado correctamente",
        "semaforo_anterior": semaforo_anterior.value,
        "semaforo_nuevo": semaforo.value
    }


@router.get("/resumen-portfolio")
async def obtener_resumen_portfolio(
    año: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener resumen de seguimiento del portfolio"""
    año_filtro = año or datetime.now().year

    # Proyectos en ejecución
    proyectos = db.query(Proyecto).filter(
        Proyecto.estado == EstadoProyecto.EN_EJECUCION,
        Proyecto.año_plan == año_filtro
    ).all()

    # Estadísticas
    total_proyectos = len(proyectos)
    semaforo_verde = sum(1 for p in proyectos if p.semaforo_salud == SemaforoSalud.VERDE)
    semaforo_amarillo = sum(1 for p in proyectos if p.semaforo_salud == SemaforoSalud.AMARILLO)
    semaforo_rojo = sum(1 for p in proyectos if p.semaforo_salud == SemaforoSalud.ROJO)

    avance_promedio = (
        sum(p.avance_porcentaje for p in proyectos) / total_proyectos
        if total_proyectos > 0 else 0
    )

    # Proyectos críticos
    proyectos_criticos = [
        {
            "id": p.id,
            "codigo": p.codigo_proyecto,
            "nombre": p.nombre,
            "semaforo": p.semaforo_salud.value,
            "avance": p.avance_porcentaje
        }
        for p in proyectos
        if p.semaforo_salud in [SemaforoSalud.AMARILLO, SemaforoSalud.ROJO]
    ]

    return {
        "año": año_filtro,
        "total_proyectos": total_proyectos,
        "semaforo": {
            "verde": semaforo_verde,
            "amarillo": semaforo_amarillo,
            "rojo": semaforo_rojo
        },
        "avance_promedio": round(avance_promedio, 1),
        "proyectos_criticos": proyectos_criticos[:5],
        "salud_portfolio": (
            "verde" if semaforo_rojo == 0 and semaforo_amarillo <= total_proyectos * 0.2 else
            "rojo" if semaforo_rojo > total_proyectos * 0.2 else
            "amarillo"
        )
    }
