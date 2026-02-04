from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from ..database import get_db
from ..models.usuario import Usuario, RolUsuario
from ..models.proyecto import Proyecto, EstadoProyecto
from ..models.planificacion import PlanAnual, PlanAnualProyecto, EstadoPlan
from ..models.iniciativa import Iniciativa
from ..utils.security import get_current_user, check_role

router = APIRouter(prefix="/api/planificacion", tags=["Planificación Anual"])


# ============== PLAN ANUAL ==============

@router.get("/planes", response_model=List[dict])
async def listar_planes_anuales(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar todos los planes anuales"""
    planes = db.query(PlanAnual).order_by(PlanAnual.año.desc()).all()

    resultado = []
    for plan in planes:
        proyectos_count = db.query(PlanAnualProyecto).filter(
            PlanAnualProyecto.plan_id == plan.id
        ).count()

        resultado.append({
            "id": plan.id,
            "año": plan.año,
            "nombre": plan.nombre,
            "presupuesto_total": float(plan.presupuesto_total),
            "presupuesto_comprometido": float(plan.presupuesto_comprometido),
            "presupuesto_ejecutado": float(plan.presupuesto_ejecutado),
            "estado": plan.estado.value,
            "proyectos_count": proyectos_count,
            "fecha_aprobacion": plan.fecha_aprobacion
        })

    return resultado


@router.get("/planes/{año}")
async def obtener_plan_anual(
    año: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener plan anual con sus proyectos"""
    plan = db.query(PlanAnual).filter(PlanAnual.año == año).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan anual no encontrado")

    # Obtener proyectos del plan
    plan_proyectos = db.query(PlanAnualProyecto).options(
        joinedload(PlanAnualProyecto.proyecto).joinedload(Proyecto.iniciativa)
    ).filter(
        PlanAnualProyecto.plan_id == plan.id
    ).order_by(PlanAnualProyecto.orden_prioridad).all()

    proyectos = []
    for pp in plan_proyectos:
        p = pp.proyecto
        proyectos.append({
            "id": p.id,
            "codigo": p.codigo_proyecto,
            "nombre": p.nombre,
            "estado": p.estado.value,
            "monto_asignado": float(pp.monto_asignado),
            "orden_prioridad": pp.orden_prioridad,
            "prioridad_iniciativa": p.iniciativa.prioridad.value if p.iniciativa and p.iniciativa.prioridad else None,
            "area": p.iniciativa.area_demandante.nombre if p.iniciativa and p.iniciativa.area_demandante else None,
            "avance": p.avance_porcentaje,
            "semaforo": p.semaforo_salud.value
        })

    return {
        "id": plan.id,
        "año": plan.año,
        "nombre": plan.nombre,
        "descripcion": plan.descripcion,
        "presupuesto_total": float(plan.presupuesto_total),
        "presupuesto_comprometido": float(plan.presupuesto_comprometido),
        "presupuesto_ejecutado": float(plan.presupuesto_ejecutado),
        "presupuesto_disponible": float(plan.presupuesto_total - plan.presupuesto_comprometido),
        "estado": plan.estado.value,
        "proyectos": proyectos,
        "fecha_aprobacion": plan.fecha_aprobacion
    }


@router.post("/planes")
async def crear_plan_anual(
    año: int,
    nombre: str,
    presupuesto_total: float,
    descripcion: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]))
):
    """Crear un nuevo plan anual"""
    # Verificar que no exista
    if db.query(PlanAnual).filter(PlanAnual.año == año).first():
        raise HTTPException(status_code=400, detail=f"Ya existe un plan para el año {año}")

    plan = PlanAnual(
        año=año,
        nombre=nombre,
        descripcion=descripcion,
        presupuesto_total=Decimal(str(presupuesto_total))
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {"mensaje": f"Plan anual {año} creado correctamente", "id": plan.id}


@router.put("/planes/{año}")
async def actualizar_plan_anual(
    año: int,
    nombre: Optional[str] = None,
    presupuesto_total: Optional[float] = None,
    descripcion: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]))
):
    """Actualizar un plan anual"""
    plan = db.query(PlanAnual).filter(PlanAnual.año == año).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan anual no encontrado")

    if plan.estado == EstadoPlan.APROBADO:
        raise HTTPException(status_code=400, detail="No se puede modificar un plan ya aprobado")

    if nombre:
        plan.nombre = nombre
    if presupuesto_total:
        plan.presupuesto_total = Decimal(str(presupuesto_total))
    if descripcion:
        plan.descripcion = descripcion

    db.commit()
    return {"mensaje": "Plan actualizado correctamente"}


@router.post("/planes/{año}/agregar-proyecto")
async def agregar_proyecto_plan(
    año: int,
    proyecto_id: int,
    monto_asignado: float,
    orden_prioridad: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]))
):
    """Agregar un proyecto al plan anual"""
    plan = db.query(PlanAnual).filter(PlanAnual.año == año).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan anual no encontrado")

    if plan.estado == EstadoPlan.APROBADO:
        raise HTTPException(status_code=400, detail="No se puede modificar un plan ya aprobado")

    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if proyecto.estado != EstadoProyecto.BANCO_RESERVA:
        raise HTTPException(status_code=400, detail="Solo se pueden agregar proyectos del banco de reserva")

    # Verificar presupuesto disponible
    monto = Decimal(str(monto_asignado))
    if plan.presupuesto_comprometido + monto > plan.presupuesto_total:
        raise HTTPException(status_code=400, detail="El monto excede el presupuesto disponible")

    # Determinar orden si no se especifica
    if not orden_prioridad:
        ultimo = db.query(PlanAnualProyecto).filter(
            PlanAnualProyecto.plan_id == plan.id
        ).order_by(PlanAnualProyecto.orden_prioridad.desc()).first()
        orden_prioridad = (ultimo.orden_prioridad + 1) if ultimo else 1

    # Agregar al plan
    plan_proyecto = PlanAnualProyecto(
        plan_id=plan.id,
        proyecto_id=proyecto_id,
        monto_asignado=monto,
        orden_prioridad=orden_prioridad
    )
    db.add(plan_proyecto)

    # Actualizar proyecto y plan
    proyecto.estado = EstadoProyecto.PLAN_ANUAL
    proyecto.año_plan = año
    proyecto.presupuesto_asignado = monto

    plan.presupuesto_comprometido += monto

    db.commit()

    return {"mensaje": "Proyecto agregado al plan anual"}


@router.delete("/planes/{año}/quitar-proyecto/{proyecto_id}")
async def quitar_proyecto_plan(
    año: int,
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]))
):
    """Quitar un proyecto del plan anual"""
    plan = db.query(PlanAnual).filter(PlanAnual.año == año).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan anual no encontrado")

    if plan.estado == EstadoPlan.APROBADO:
        raise HTTPException(status_code=400, detail="No se puede modificar un plan ya aprobado")

    plan_proyecto = db.query(PlanAnualProyecto).filter(
        PlanAnualProyecto.plan_id == plan.id,
        PlanAnualProyecto.proyecto_id == proyecto_id
    ).first()

    if not plan_proyecto:
        raise HTTPException(status_code=404, detail="El proyecto no está en este plan")

    # Restaurar presupuesto
    plan.presupuesto_comprometido -= plan_proyecto.monto_asignado

    # Regresar proyecto al banco
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if proyecto:
        proyecto.estado = EstadoProyecto.BANCO_RESERVA
        proyecto.año_plan = None

    db.delete(plan_proyecto)
    db.commit()

    return {"mensaje": "Proyecto removido del plan anual"}


@router.post("/planes/{año}/aprobar")
async def aprobar_plan_anual(
    año: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]))
):
    """Aprobar el plan anual (CGEDx)"""
    plan = db.query(PlanAnual).filter(PlanAnual.año == año).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan anual no encontrado")

    if plan.estado != EstadoPlan.BORRADOR and plan.estado != EstadoPlan.EN_REVISION:
        raise HTTPException(status_code=400, detail="El plan no está en estado para aprobar")

    # Verificar que tenga proyectos
    proyectos_count = db.query(PlanAnualProyecto).filter(
        PlanAnualProyecto.plan_id == plan.id
    ).count()

    if proyectos_count == 0:
        raise HTTPException(status_code=400, detail="El plan debe tener al menos un proyecto")

    plan.estado = EstadoPlan.APROBADO
    plan.aprobado_por = current_user.id
    plan.fecha_aprobacion = datetime.utcnow()

    db.commit()

    return {"mensaje": f"Plan anual {año} aprobado correctamente"}


@router.get("/simulacion/{año}")
async def simular_plan(
    año: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]))
):
    """Simular escenarios para el plan anual"""
    plan = db.query(PlanAnual).filter(PlanAnual.año == año).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan anual no encontrado")

    # Obtener proyectos en banco de reserva
    proyectos_disponibles = db.query(Proyecto).options(
        joinedload(Proyecto.iniciativa)
    ).filter(
        Proyecto.estado == EstadoProyecto.BANCO_RESERVA
    ).all()

    disponible = float(plan.presupuesto_total - plan.presupuesto_comprometido)

    # Ordenar por prioridad
    proyectos_ordenados = sorted(
        proyectos_disponibles,
        key=lambda p: (
            0 if p.iniciativa and p.iniciativa.prioridad and p.iniciativa.prioridad.value == "P1" else
            1 if p.iniciativa and p.iniciativa.prioridad and p.iniciativa.prioridad.value == "P2" else
            2 if p.iniciativa and p.iniciativa.prioridad and p.iniciativa.prioridad.value == "P3" else
            3 if p.iniciativa and p.iniciativa.prioridad and p.iniciativa.prioridad.value == "P4" else 4
        )
    )

    # Escenario optimista: todos los que caben por prioridad
    escenario_optimista = []
    presupuesto_usado = 0
    for p in proyectos_ordenados:
        monto = float(p.presupuesto_asignado or p.iniciativa.monto_estimado if p.iniciativa else 0)
        if presupuesto_usado + monto <= disponible:
            escenario_optimista.append({
                "id": p.id,
                "codigo": p.codigo_proyecto,
                "nombre": p.nombre,
                "monto": monto,
                "prioridad": p.iniciativa.prioridad.value if p.iniciativa and p.iniciativa.prioridad else None
            })
            presupuesto_usado += monto

    return {
        "presupuesto_total": float(plan.presupuesto_total),
        "presupuesto_comprometido": float(plan.presupuesto_comprometido),
        "presupuesto_disponible": disponible,
        "proyectos_disponibles": len(proyectos_disponibles),
        "escenario_optimista": {
            "proyectos": escenario_optimista,
            "presupuesto_usado": presupuesto_usado,
            "presupuesto_restante": disponible - presupuesto_usado
        }
    }
