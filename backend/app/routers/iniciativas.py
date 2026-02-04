from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from ..database import get_db
from ..models.usuario import Usuario, RolUsuario
from ..models.iniciativa import (
    Iniciativa, ScoringIniciativa, EstadoIniciativa,
    ClasificacionInversion, Prioridad, HistorialEstadoIniciativa
)
from ..schemas.iniciativa import (
    Iniciativa as IniciativaSchema, IniciativaCreate, IniciativaUpdate,
    IniciativaResumen, IniciativaConDetalles,
    ScoringIniciativa as ScoringSchema, ScoringIniciativaCreate,
    HistorialEstado, IniciativaPipeline, PipelineStats, WorkflowMetrics
)
from ..utils.security import get_current_user, check_role
from ..services.scoring import ScoringService

router = APIRouter(prefix="/api/iniciativas", tags=["Iniciativas"])


def registrar_cambio_estado(
    db: Session,
    iniciativa: Iniciativa,
    estado_anterior: EstadoIniciativa,
    estado_nuevo: EstadoIniciativa,
    usuario_id: int,
    comentario: str = None
):
    """Registra un cambio de estado en el historial"""
    historial = HistorialEstadoIniciativa(
        iniciativa_id=iniciativa.id,
        estado_anterior=estado_anterior,
        estado_nuevo=estado_nuevo,
        usuario_id=usuario_id,
        comentario=comentario
    )
    db.add(historial)
    return historial


def generar_codigo_iniciativa(db: Session) -> str:
    """Genera un código único para la iniciativa"""
    año = datetime.now().year
    ultimo = db.query(Iniciativa).filter(
        Iniciativa.codigo.like(f"INI-{año}-%")
    ).order_by(Iniciativa.id.desc()).first()

    if ultimo:
        num = int(ultimo.codigo.split("-")[-1]) + 1
    else:
        num = 1

    return f"INI-{año}-{num:04d}"


@router.get("/", response_model=List[IniciativaResumen])
async def listar_iniciativas(
    skip: int = 0,
    limit: int = 100,
    estado: Optional[EstadoIniciativa] = None,
    prioridad: Optional[Prioridad] = None,
    clasificacion: Optional[ClasificacionInversion] = None,
    area_id: Optional[int] = None,
    busqueda: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar iniciativas con filtros"""
    query = db.query(Iniciativa).options(joinedload(Iniciativa.area_demandante))

    # Filtrar por rol
    if current_user.rol == RolUsuario.DEMANDANTE:
        query = query.filter(Iniciativa.created_by == current_user.id)

    # Aplicar filtros
    if estado:
        query = query.filter(Iniciativa.estado == estado)
    if prioridad:
        query = query.filter(Iniciativa.prioridad == prioridad)
    if clasificacion:
        query = query.filter(Iniciativa.clasificacion_inversion == clasificacion)
    if area_id:
        query = query.filter(Iniciativa.area_demandante_id == area_id)
    if busqueda:
        query = query.filter(
            Iniciativa.titulo.ilike(f"%{busqueda}%") |
            Iniciativa.descripcion.ilike(f"%{busqueda}%")
        )

    iniciativas = query.order_by(Iniciativa.fecha_solicitud.desc()).offset(skip).limit(limit).all()

    # Formatear respuesta
    resultado = []
    for ini in iniciativas:
        resultado.append(IniciativaResumen(
            id=ini.id,
            codigo=ini.codigo,
            titulo=ini.titulo,
            estado=ini.estado,
            prioridad=ini.prioridad,
            monto_estimado=ini.monto_estimado,
            clasificacion_inversion=ini.clasificacion_inversion,
            fecha_solicitud=ini.fecha_solicitud,
            area_demandante_nombre=ini.area_demandante.nombre if ini.area_demandante else None
        ))

    return resultado


# ============ PIPELINE Y WORKFLOW (debe ir ANTES de rutas dinámicas) ============

@router.get("/workflow/pipeline", response_model=List[IniciativaPipeline])
async def obtener_pipeline(
    area_id: Optional[int] = None,
    prioridad: Optional[Prioridad] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener todas las iniciativas organizadas para vista pipeline/kanban"""
    query = db.query(Iniciativa).options(
        joinedload(Iniciativa.area_demandante),
        joinedload(Iniciativa.creador)
    )

    # Filtros
    if area_id:
        query = query.filter(Iniciativa.area_demandante_id == area_id)
    if prioridad:
        query = query.filter(Iniciativa.prioridad == prioridad)

    # Filtrar por rol si es demandante
    if current_user.rol == RolUsuario.DEMANDANTE:
        query = query.filter(Iniciativa.created_by == current_user.id)

    iniciativas = query.order_by(Iniciativa.fecha_solicitud.desc()).all()

    resultado = []
    ahora = datetime.utcnow()

    for ini in iniciativas:
        # Calcular días en estado actual
        ultimo_cambio = db.query(HistorialEstadoIniciativa).filter(
            HistorialEstadoIniciativa.iniciativa_id == ini.id
        ).order_by(HistorialEstadoIniciativa.fecha.desc()).first()

        if ultimo_cambio:
            dias_en_estado = (ahora - ultimo_cambio.fecha).days
        else:
            dias_en_estado = (ahora - ini.created_at).days

        resultado.append(IniciativaPipeline(
            id=ini.id,
            codigo=ini.codigo,
            titulo=ini.titulo,
            estado=ini.estado,
            prioridad=ini.prioridad,
            monto_estimado=ini.monto_estimado,
            area_demandante_nombre=ini.area_demandante.nombre if ini.area_demandante else None,
            creador_nombre=ini.creador.nombre_completo if ini.creador else None,
            fecha_solicitud=ini.fecha_solicitud,
            dias_en_estado=dias_en_estado,
            urgencia=ini.urgencia
        ))

    return resultado


@router.get("/workflow/metrics", response_model=WorkflowMetrics)
async def obtener_metricas_workflow(
    año: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener métricas del workflow (funnel, tiempos, tasas)"""
    query = db.query(Iniciativa)

    if año:
        query = query.filter(func.extract('year', Iniciativa.fecha_solicitud) == año)

    # Contar por estado
    total = query.count()
    estados_count = {}
    montos_por_estado = {}

    for estado in EstadoIniciativa:
        count = query.filter(Iniciativa.estado == estado).count()
        monto = db.query(func.sum(Iniciativa.monto_estimado)).filter(
            Iniciativa.estado == estado
        ).scalar() or 0
        estados_count[estado.value] = count
        montos_por_estado[estado.value] = float(monto)

    # Calcular estadísticas
    por_estado = []
    for estado in EstadoIniciativa:
        cantidad = estados_count.get(estado.value, 0)
        monto = montos_por_estado.get(estado.value, 0)
        porcentaje = (cantidad / total * 100) if total > 0 else 0
        por_estado.append(PipelineStats(
            estado=estado.value,
            cantidad=cantidad,
            monto_total=Decimal(monto),
            porcentaje=round(porcentaje, 1)
        ))

    # Tasas
    aprobadas = estados_count.get(EstadoIniciativa.APROBADA.value, 0) + \
                estados_count.get(EstadoIniciativa.EN_BANCO_RESERVA.value, 0) + \
                estados_count.get(EstadoIniciativa.EN_PLAN_ANUAL.value, 0) + \
                estados_count.get(EstadoIniciativa.ACTIVADA.value, 0)
    rechazadas = estados_count.get(EstadoIniciativa.RECHAZADA.value, 0)

    evaluadas = aprobadas + rechazadas
    tasa_aprobacion = (aprobadas / evaluadas * 100) if evaluadas > 0 else 0
    tasa_rechazo = (rechazadas / evaluadas * 100) if evaluadas > 0 else 0

    return WorkflowMetrics(
        total_iniciativas=total,
        por_estado=por_estado,
        tiempo_promedio_aprobacion=None,
        tasa_aprobacion=round(tasa_aprobacion, 1),
        tasa_rechazo=round(tasa_rechazo, 1)
    )


# ============ RUTAS DINÁMICAS ============

@router.get("/{iniciativa_id}", response_model=IniciativaConDetalles)
async def obtener_iniciativa(
    iniciativa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener detalle de una iniciativa"""
    iniciativa = db.query(Iniciativa).options(
        joinedload(Iniciativa.area_demandante),
        joinedload(Iniciativa.creador),
        joinedload(Iniciativa.scoring),
        joinedload(Iniciativa.evaluaciones),
        joinedload(Iniciativa.proyecto)
    ).filter(Iniciativa.id == iniciativa_id).first()

    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    return IniciativaConDetalles(
        **{k: v for k, v in iniciativa.__dict__.items() if not k.startswith('_')},
        area_demandante_nombre=iniciativa.area_demandante.nombre if iniciativa.area_demandante else None,
        creador_nombre=iniciativa.creador.nombre_completo if iniciativa.creador else None,
        evaluaciones_count=len(iniciativa.evaluaciones),
        tiene_proyecto=iniciativa.proyecto is not None
    )


@router.post("/", response_model=IniciativaSchema)
async def crear_iniciativa(
    iniciativa: IniciativaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear una nueva iniciativa"""
    db_iniciativa = Iniciativa(
        codigo=generar_codigo_iniciativa(db),
        created_by=current_user.id,
        **iniciativa.model_dump()
    )

    db.add(db_iniciativa)
    db.commit()
    db.refresh(db_iniciativa)

    # Registrar estado inicial en historial
    registrar_cambio_estado(
        db, db_iniciativa, None, EstadoIniciativa.BORRADOR,
        current_user.id, "Iniciativa creada"
    )

    # Calcular clasificación automáticamente
    ScoringService.procesar_iniciativa(db, db_iniciativa)

    db.commit()
    return db_iniciativa


@router.put("/{iniciativa_id}", response_model=IniciativaSchema)
async def actualizar_iniciativa(
    iniciativa_id: int,
    iniciativa: IniciativaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar una iniciativa"""
    db_iniciativa = db.query(Iniciativa).filter(Iniciativa.id == iniciativa_id).first()

    if not db_iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    # Solo el creador o admin puede editar
    if current_user.rol not in [RolUsuario.ADMINISTRADOR, RolUsuario.JEFE_TD]:
        if db_iniciativa.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="No tiene permisos para editar esta iniciativa")

    # No se puede editar si ya está aprobada o en ejecución
    if db_iniciativa.estado in [EstadoIniciativa.ACTIVADA]:
        raise HTTPException(status_code=400, detail="No se puede editar una iniciativa activada")

    update_data = iniciativa.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_iniciativa, key, value)

    db.commit()

    # Recalcular clasificación si cambió el monto
    if "monto_estimado" in update_data or "porcentaje_transformacion" in update_data:
        ScoringService.procesar_iniciativa(db, db_iniciativa)

    db.refresh(db_iniciativa)
    return db_iniciativa


@router.post("/{iniciativa_id}/enviar")
async def enviar_iniciativa(
    iniciativa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Enviar iniciativa para revisión"""
    iniciativa = db.query(Iniciativa).filter(Iniciativa.id == iniciativa_id).first()

    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    if iniciativa.estado != EstadoIniciativa.BORRADOR:
        raise HTTPException(status_code=400, detail="Solo se pueden enviar iniciativas en borrador")

    estado_anterior = iniciativa.estado
    iniciativa.estado = EstadoIniciativa.ENVIADA
    iniciativa.fecha_solicitud = datetime.utcnow()

    # Registrar en historial
    registrar_cambio_estado(
        db, iniciativa, estado_anterior, EstadoIniciativa.ENVIADA,
        current_user.id, "Enviada para revisión"
    )

    db.commit()

    return {"mensaje": "Iniciativa enviada correctamente"}


@router.post("/{iniciativa_id}/scoring", response_model=ScoringSchema)
async def calcular_scoring(
    iniciativa_id: int,
    scoring_data: ScoringIniciativaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.ANALISTA_TD, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Calcular y guardar scoring de una iniciativa"""
    iniciativa = db.query(Iniciativa).filter(Iniciativa.id == iniciativa_id).first()

    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    # Procesar scoring
    scoring_dict = scoring_data.model_dump(exclude={'iniciativa_id'})
    ScoringService.procesar_iniciativa(db, iniciativa, scoring_dict)

    # Actualizar estado
    if iniciativa.estado == EstadoIniciativa.ENVIADA:
        iniciativa.estado = EstadoIniciativa.EN_REVISION

    db.commit()
    db.refresh(iniciativa)

    return iniciativa.scoring


@router.post("/{iniciativa_id}/aprobar-revision")
async def aprobar_revision(
    iniciativa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR]))
):
    """Aprobar revisión y enviar a evaluación del comité"""
    iniciativa = db.query(Iniciativa).filter(Iniciativa.id == iniciativa_id).first()

    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    if iniciativa.estado != EstadoIniciativa.EN_REVISION:
        raise HTTPException(status_code=400, detail="La iniciativa no está en revisión")

    if not iniciativa.scoring:
        raise HTTPException(status_code=400, detail="La iniciativa debe tener scoring calculado")

    estado_anterior = iniciativa.estado
    iniciativa.estado = EstadoIniciativa.EN_EVALUACION

    # Registrar en historial
    registrar_cambio_estado(
        db, iniciativa, estado_anterior, EstadoIniciativa.EN_EVALUACION,
        current_user.id, "Revisión aprobada, enviada a evaluación del comité"
    )

    db.commit()

    return {"mensaje": "Iniciativa enviada a evaluación del comité"}


@router.delete("/{iniciativa_id}")
async def eliminar_iniciativa(
    iniciativa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.ADMINISTRADOR]))
):
    """Eliminar una iniciativa (solo borradores)"""
    iniciativa = db.query(Iniciativa).filter(Iniciativa.id == iniciativa_id).first()

    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    if iniciativa.estado != EstadoIniciativa.BORRADOR:
        raise HTTPException(status_code=400, detail="Solo se pueden eliminar iniciativas en borrador")

    db.delete(iniciativa)
    db.commit()

    return {"mensaje": "Iniciativa eliminada correctamente"}


@router.get("/{iniciativa_id}/historial", response_model=List[HistorialEstado])
async def obtener_historial_estados(
    iniciativa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener historial de cambios de estado de una iniciativa"""
    iniciativa = db.query(Iniciativa).filter(Iniciativa.id == iniciativa_id).first()
    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    historial = db.query(HistorialEstadoIniciativa).options(
        joinedload(HistorialEstadoIniciativa.usuario)
    ).filter(
        HistorialEstadoIniciativa.iniciativa_id == iniciativa_id
    ).order_by(HistorialEstadoIniciativa.fecha.asc()).all()

    resultado = []
    for h in historial:
        resultado.append(HistorialEstado(
            id=h.id,
            iniciativa_id=h.iniciativa_id,
            estado_anterior=h.estado_anterior,
            estado_nuevo=h.estado_nuevo,
            comentario=h.comentario,
            usuario_id=h.usuario_id,
            fecha=h.fecha,
            usuario_nombre=h.usuario.nombre_completo if h.usuario else None
        ))

    return resultado


@router.post("/{iniciativa_id}/cambiar-estado")
async def cambiar_estado_iniciativa(
    iniciativa_id: int,
    nuevo_estado: EstadoIniciativa,
    comentario: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR
    ]))
):
    """Cambiar estado de una iniciativa manualmente (para admin/jefe)"""
    iniciativa = db.query(Iniciativa).filter(Iniciativa.id == iniciativa_id).first()

    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    estado_anterior = iniciativa.estado

    # Validar transiciones permitidas
    transiciones_validas = {
        EstadoIniciativa.BORRADOR: [EstadoIniciativa.ENVIADA],
        EstadoIniciativa.ENVIADA: [EstadoIniciativa.EN_REVISION, EstadoIniciativa.RECHAZADA],
        EstadoIniciativa.EN_REVISION: [EstadoIniciativa.EN_EVALUACION, EstadoIniciativa.RECHAZADA],
        EstadoIniciativa.EN_EVALUACION: [EstadoIniciativa.APROBADA, EstadoIniciativa.RECHAZADA],
        EstadoIniciativa.APROBADA: [EstadoIniciativa.EN_BANCO_RESERVA],
        EstadoIniciativa.EN_BANCO_RESERVA: [EstadoIniciativa.EN_PLAN_ANUAL],
        EstadoIniciativa.EN_PLAN_ANUAL: [EstadoIniciativa.ACTIVADA],
        EstadoIniciativa.ACTIVADA: [],
        EstadoIniciativa.RECHAZADA: [EstadoIniciativa.BORRADOR]  # Permitir reabrir
    }

    # Admin puede hacer cualquier transición
    if current_user.rol != RolUsuario.ADMINISTRADOR:
        if nuevo_estado not in transiciones_validas.get(estado_anterior, []):
            raise HTTPException(
                status_code=400,
                detail=f"No se puede cambiar de {estado_anterior.value} a {nuevo_estado.value}"
            )

    # Registrar historial
    registrar_cambio_estado(
        db, iniciativa, estado_anterior, nuevo_estado,
        current_user.id, comentario
    )

    # Actualizar estado
    iniciativa.estado = nuevo_estado

    # Actualizar fecha de aprobación si aplica
    if nuevo_estado == EstadoIniciativa.APROBADA:
        iniciativa.fecha_aprobacion = datetime.utcnow()

    db.commit()

    return {
        "mensaje": f"Estado cambiado de {estado_anterior.value} a {nuevo_estado.value}",
        "estado_anterior": estado_anterior.value,
        "estado_nuevo": nuevo_estado.value
    }
