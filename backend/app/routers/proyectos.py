from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.usuario import Usuario, RolUsuario
from ..models.proyecto import (
    Proyecto, EstadoProyecto, FaseProyecto, HitoProyecto,
    RiesgoProyecto, IssueProyecto, BitacoraProyecto, SemaforoSalud
)
from ..models.iniciativa import Iniciativa, EstadoIniciativa
from ..models.presupuesto import PresupuestoProyecto
from ..schemas.proyecto import (
    Proyecto as ProyectoSchema, ProyectoCreate, ProyectoUpdate,
    ProyectoConDetalles,
    FaseProyecto as FaseSchema, FaseProyectoCreate, FaseProyectoUpdate,
    HitoProyecto as HitoSchema, HitoProyectoCreate,
    RiesgoProyecto as RiesgoSchema, RiesgoProyectoCreate,
    IssueProyecto as IssueSchema, IssueProyectoCreate,
    BitacoraProyecto as BitacoraSchema, BitacoraProyectoCreate
)
from ..utils.security import get_current_user, check_role

router = APIRouter(prefix="/api/proyectos", tags=["Proyectos"])


@router.get("/", response_model=List[ProyectoConDetalles])
async def listar_proyectos(
    skip: int = 0,
    limit: int = 100,
    estado: Optional[EstadoProyecto] = None,
    año: Optional[int] = None,
    semaforo: Optional[SemaforoSalud] = None,
    area_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar proyectos con filtros"""
    query = db.query(Proyecto).options(
        joinedload(Proyecto.iniciativa).joinedload(Iniciativa.area_demandante),
        joinedload(Proyecto.fases),
        joinedload(Proyecto.presupuesto)
    )

    if estado:
        query = query.filter(Proyecto.estado == estado)
    if año:
        query = query.filter(Proyecto.año_plan == año)
    if semaforo:
        query = query.filter(Proyecto.semaforo_salud == semaforo)
    if area_id:
        query = query.join(Iniciativa).filter(Iniciativa.area_demandante_id == area_id)

    proyectos = query.order_by(Proyecto.created_at.desc()).offset(skip).limit(limit).all()

    resultado = []
    for p in proyectos:
        riesgos_abiertos = db.query(RiesgoProyecto).filter(
            RiesgoProyecto.proyecto_id == p.id,
            RiesgoProyecto.estado == "abierto"
        ).count()

        issues_abiertos = db.query(IssueProyecto).filter(
            IssueProyecto.proyecto_id == p.id,
            IssueProyecto.estado.in_(["abierto", "en_progreso"])
        ).count()

        resultado.append(ProyectoConDetalles(
            **{k: v for k, v in p.__dict__.items() if not k.startswith('_')},
            iniciativa_titulo=p.iniciativa.titulo if p.iniciativa else None,
            area_demandante_nombre=p.iniciativa.area_demandante.nombre if p.iniciativa and p.iniciativa.area_demandante else None,
            fases=[FaseSchema(**{k: v for k, v in f.__dict__.items() if not k.startswith('_')}) for f in p.fases],
            riesgos_abiertos=riesgos_abiertos,
            issues_abiertos=issues_abiertos
        ))

    return resultado


@router.get("/banco-reserva", response_model=List[ProyectoConDetalles])
async def listar_banco_reserva(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar proyectos en el banco de reserva"""
    return await listar_proyectos(
        estado=EstadoProyecto.BANCO_RESERVA,
        db=db,
        current_user=current_user
    )


@router.get("/{proyecto_id}", response_model=ProyectoConDetalles)
async def obtener_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener detalle de un proyecto"""
    proyecto = db.query(Proyecto).options(
        joinedload(Proyecto.iniciativa).joinedload(Iniciativa.area_demandante),
        joinedload(Proyecto.fases),
        joinedload(Proyecto.hitos),
        joinedload(Proyecto.presupuesto),
        joinedload(Proyecto.riesgos),
        joinedload(Proyecto.issues)
    ).filter(Proyecto.id == proyecto_id).first()

    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    riesgos_abiertos = sum(1 for r in proyecto.riesgos if r.estado == "abierto")
    issues_abiertos = sum(1 for i in proyecto.issues if i.estado in ["abierto", "en_progreso"])

    return ProyectoConDetalles(
        **{k: v for k, v in proyecto.__dict__.items() if not k.startswith('_')},
        iniciativa_titulo=proyecto.iniciativa.titulo if proyecto.iniciativa else None,
        area_demandante_nombre=proyecto.iniciativa.area_demandante.nombre if proyecto.iniciativa and proyecto.iniciativa.area_demandante else None,
        fases=[FaseSchema(**{k: v for k, v in f.__dict__.items() if not k.startswith('_')}) for f in proyecto.fases],
        riesgos_abiertos=riesgos_abiertos,
        issues_abiertos=issues_abiertos
    )


@router.put("/{proyecto_id}", response_model=ProyectoSchema)
async def actualizar_proyecto(
    proyecto_id: int,
    proyecto: ProyectoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.ANALISTA_TD, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Actualizar un proyecto"""
    db_proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()

    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    update_data = proyecto.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_proyecto, key, value)

    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto


@router.post("/{proyecto_id}/activar")
async def activar_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]))
):
    """Activar un proyecto (ponerlo en ejecución)"""
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()

    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if proyecto.estado not in [EstadoProyecto.BANCO_RESERVA, EstadoProyecto.PLAN_ANUAL]:
        raise HTTPException(status_code=400, detail="Solo se pueden activar proyectos del banco de reserva o plan anual")

    proyecto.estado = EstadoProyecto.EN_EJECUCION
    proyecto.fecha_activacion = datetime.utcnow()
    proyecto.fecha_inicio_real = datetime.utcnow()

    # Actualizar estado de la iniciativa
    if proyecto.iniciativa:
        proyecto.iniciativa.estado = EstadoIniciativa.ACTIVADA

    # Crear PresupuestoProyecto automáticamente si no existe
    presupuesto_existente = db.query(PresupuestoProyecto).filter(
        PresupuestoProyecto.proyecto_id == proyecto_id
    ).first()

    if not presupuesto_existente:
        # Calcular CAPEX y OPEX basado en el presupuesto asignado
        # Por defecto 80% CAPEX, 20% OPEX (puede ajustarse en informe de factibilidad)
        monto_total = proyecto.presupuesto_asignado or 0
        capex_estimado = monto_total * 0.8
        opex_estimado = monto_total * 0.2

        nuevo_presupuesto = PresupuestoProyecto(
            proyecto_id=proyecto_id,
            capex_aprobado=capex_estimado,
            capex_comprometido=0,
            capex_ejecutado=0,
            opex_proyectado_anual=opex_estimado,
            fecha_aprobacion=datetime.utcnow(),
            aprobado_por=current_user.id
        )
        db.add(nuevo_presupuesto)

    db.commit()

    return {
        "mensaje": "Proyecto activado correctamente",
        "presupuesto_creado": not presupuesto_existente,
        "presupuesto_asignado": float(proyecto.presupuesto_asignado or 0)
    }


@router.post("/{proyecto_id}/cerrar")
async def cerrar_proyecto(
    proyecto_id: int,
    lecciones_aprendidas: Optional[str] = None,
    metricas_exito: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR]))
):
    """Cerrar un proyecto completado"""
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()

    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if proyecto.estado != EstadoProyecto.EN_EJECUCION:
        raise HTTPException(status_code=400, detail="Solo se pueden cerrar proyectos en ejecución")

    proyecto.estado = EstadoProyecto.COMPLETADO
    proyecto.fecha_fin_real = datetime.utcnow()
    proyecto.fecha_cierre = datetime.utcnow()
    proyecto.avance_porcentaje = 100

    if lecciones_aprendidas:
        proyecto.lecciones_aprendidas = lecciones_aprendidas
    if metricas_exito:
        proyecto.metricas_exito = metricas_exito

    db.commit()

    return {"mensaje": "Proyecto cerrado correctamente"}


# ============== FASES ==============

@router.get("/{proyecto_id}/fases", response_model=List[FaseSchema])
async def listar_fases(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar fases de un proyecto"""
    return db.query(FaseProyecto).filter(
        FaseProyecto.proyecto_id == proyecto_id
    ).order_by(FaseProyecto.orden).all()


@router.post("/{proyecto_id}/fases", response_model=FaseSchema)
async def crear_fase(
    proyecto_id: int,
    fase: FaseProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.ANALISTA_TD, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Crear una fase del proyecto"""
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    db_fase = FaseProyecto(**fase.model_dump())
    db.add(db_fase)
    db.commit()
    db.refresh(db_fase)
    return db_fase


@router.put("/fases/{fase_id}", response_model=FaseSchema)
async def actualizar_fase(
    fase_id: int,
    fase: FaseProyectoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar una fase"""
    db_fase = db.query(FaseProyecto).filter(FaseProyecto.id == fase_id).first()
    if not db_fase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")

    update_data = fase.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_fase, key, value)

    db.commit()
    db.refresh(db_fase)
    return db_fase


# ============== HITOS ==============

@router.post("/{proyecto_id}/hitos", response_model=HitoSchema)
async def crear_hito(
    proyecto_id: int,
    hito: HitoProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear un hito del proyecto"""
    db_hito = HitoProyecto(**hito.model_dump())
    db.add(db_hito)
    db.commit()
    db.refresh(db_hito)
    return db_hito


@router.put("/hitos/{hito_id}/completar")
async def completar_hito(
    hito_id: int,
    evidencia_url: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Marcar un hito como completado"""
    hito = db.query(HitoProyecto).filter(HitoProyecto.id == hito_id).first()
    if not hito:
        raise HTTPException(status_code=404, detail="Hito no encontrado")

    hito.completado = True
    hito.fecha_real = datetime.utcnow()
    if evidencia_url:
        hito.evidencia_url = evidencia_url

    db.commit()
    return {"mensaje": "Hito completado"}


# ============== RIESGOS ==============

@router.get("/{proyecto_id}/riesgos", response_model=List[RiesgoSchema])
async def listar_riesgos(
    proyecto_id: int,
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar riesgos de un proyecto"""
    query = db.query(RiesgoProyecto).filter(RiesgoProyecto.proyecto_id == proyecto_id)
    if estado:
        query = query.filter(RiesgoProyecto.estado == estado)
    return query.all()


@router.post("/{proyecto_id}/riesgos", response_model=RiesgoSchema)
async def crear_riesgo(
    proyecto_id: int,
    riesgo: RiesgoProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Registrar un riesgo del proyecto"""
    db_riesgo = RiesgoProyecto(**riesgo.model_dump())
    db.add(db_riesgo)
    db.commit()
    db.refresh(db_riesgo)
    return db_riesgo


# ============== ISSUES ==============

@router.get("/{proyecto_id}/issues", response_model=List[IssueSchema])
async def listar_issues(
    proyecto_id: int,
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar issues de un proyecto"""
    query = db.query(IssueProyecto).filter(IssueProyecto.proyecto_id == proyecto_id)
    if estado:
        query = query.filter(IssueProyecto.estado == estado)
    return query.order_by(IssueProyecto.fecha_creacion.desc()).all()


@router.post("/{proyecto_id}/issues", response_model=IssueSchema)
async def crear_issue(
    proyecto_id: int,
    issue: IssueProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Registrar un issue del proyecto"""
    db_issue = IssueProyecto(**issue.model_dump())
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue


# ============== BITÁCORA ==============

@router.get("/{proyecto_id}/bitacora", response_model=List[BitacoraSchema])
async def listar_bitacora(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar entradas de la bitácora de un proyecto"""
    entradas = db.query(BitacoraProyecto).options(
        joinedload(BitacoraProyecto.usuario)
    ).filter(
        BitacoraProyecto.proyecto_id == proyecto_id
    ).order_by(BitacoraProyecto.fecha.desc()).all()

    resultado = []
    for e in entradas:
        resultado.append(BitacoraSchema(
            **{k: v for k, v in e.__dict__.items() if not k.startswith('_')},
            usuario_nombre=e.usuario.nombre_completo if e.usuario else None
        ))

    return resultado


@router.post("/{proyecto_id}/bitacora", response_model=BitacoraSchema)
async def crear_entrada_bitacora(
    proyecto_id: int,
    entrada: BitacoraProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear una entrada en la bitácora del proyecto"""
    db_entrada = BitacoraProyecto(
        **entrada.model_dump(),
        usuario_id=current_user.id
    )
    db.add(db_entrada)
    db.commit()
    db.refresh(db_entrada)

    return BitacoraSchema(
        **{k: v for k, v in db_entrada.__dict__.items() if not k.startswith('_')},
        usuario_nombre=current_user.nombre_completo
    )
