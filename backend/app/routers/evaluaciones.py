from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.usuario import Usuario, RolUsuario
from ..models.iniciativa import Iniciativa, EstadoIniciativa
from ..models.evaluacion import EvaluacionComite
from ..models.proyecto import Proyecto, EstadoProyecto
from ..schemas.evaluacion import (
    EvaluacionComite as EvaluacionSchema,
    EvaluacionComiteCreate, EvaluacionComiteUpdate
)
from ..utils.security import get_current_user, check_role
from ..services.scoring import ScoringService
from ..config import settings

router = APIRouter(prefix="/api/evaluaciones", tags=["Evaluaciones"])


@router.get("/pendientes", response_model=List[dict])
async def listar_evaluaciones_pendientes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.COMITE_EXPERTOS, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Listar iniciativas pendientes de evaluación"""
    iniciativas = db.query(Iniciativa).options(
        joinedload(Iniciativa.area_demandante),
        joinedload(Iniciativa.evaluaciones)
    ).filter(
        Iniciativa.estado == EstadoIniciativa.EN_EVALUACION
    ).all()

    resultado = []
    for ini in iniciativas:
        # Verificar si el usuario ya evaluó
        ya_evaluo = any(e.evaluador_id == current_user.id for e in ini.evaluaciones)

        resultado.append({
            "id": ini.id,
            "codigo": ini.codigo,
            "titulo": ini.titulo,
            "monto_estimado": float(ini.monto_estimado),
            "tipo_informe": ini.tipo_informe.value if ini.tipo_informe else None,
            "clasificacion": ini.clasificacion_inversion.value if ini.clasificacion_inversion else None,
            "prioridad": ini.prioridad.value if ini.prioridad else None,
            "area_demandante": ini.area_demandante.nombre if ini.area_demandante else None,
            "fecha_solicitud": ini.fecha_solicitud,
            "evaluaciones_count": len(ini.evaluaciones),
            "ya_evaluo": ya_evaluo
        })

    return resultado


@router.get("/iniciativa/{iniciativa_id}", response_model=List[EvaluacionSchema])
async def listar_evaluaciones_iniciativa(
    iniciativa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar evaluaciones de una iniciativa"""
    evaluaciones = db.query(EvaluacionComite).options(
        joinedload(EvaluacionComite.evaluador)
    ).filter(
        EvaluacionComite.iniciativa_id == iniciativa_id
    ).all()

    resultado = []
    for ev in evaluaciones:
        ev_dict = {k: v for k, v in ev.__dict__.items() if not k.startswith('_')}
        ev_dict['evaluador_nombre'] = ev.evaluador.nombre_completo if ev.evaluador else None
        resultado.append(EvaluacionSchema(**ev_dict))

    return resultado


@router.post("/", response_model=EvaluacionSchema)
async def crear_evaluacion(
    evaluacion: EvaluacionComiteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.COMITE_EXPERTOS, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Crear una evaluación del comité"""
    # Verificar que la iniciativa existe y está en evaluación
    iniciativa = db.query(Iniciativa).filter(
        Iniciativa.id == evaluacion.iniciativa_id
    ).first()

    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    if iniciativa.estado != EstadoIniciativa.EN_EVALUACION:
        raise HTTPException(status_code=400, detail="La iniciativa no está en fase de evaluación")

    # Verificar que el usuario no haya evaluado ya
    existente = db.query(EvaluacionComite).filter(
        EvaluacionComite.iniciativa_id == evaluacion.iniciativa_id,
        EvaluacionComite.evaluador_id == current_user.id
    ).first()

    if existente:
        raise HTTPException(status_code=400, detail="Ya ha evaluado esta iniciativa")

    # Crear evaluación
    ev_data = evaluacion.model_dump()
    ev_data['evaluador_id'] = current_user.id

    # Calcular subtotales y total
    ev_data['dim1_subtotal'] = (
        ev_data['dim1_claridad_problema'] +
        ev_data['dim1_beneficios_cuantificados'] +
        ev_data['dim1_alineacion_estrategica']
    )
    ev_data['dim2_subtotal'] = (
        ev_data['dim2_arquitectura'] +
        ev_data['dim2_integracion'] +
        ev_data['dim2_seguridad'] +
        ev_data['dim2_escalabilidad']
    )
    ev_data['dim3_subtotal'] = (
        ev_data['dim3_presupuesto_detallado'] +
        ev_data['dim3_roi_tco'] +
        ev_data['dim3_riesgos_financieros']
    )

    ev_data['puntaje_total'] = (
        ev_data['dim1_subtotal'] +
        ev_data['dim2_subtotal'] +
        ev_data['dim3_subtotal']
    )

    # Determinar si aprueba (>= 80 y sin veto)
    ev_data['aprobado'] = (
        float(ev_data['puntaje_total']) >= settings.UMBRAL_APROBACION_COMITE and
        not ev_data['veto']
    )

    db_evaluacion = EvaluacionComite(**ev_data)
    db.add(db_evaluacion)
    db.commit()
    db.refresh(db_evaluacion)

    return db_evaluacion


@router.put("/{evaluacion_id}", response_model=EvaluacionSchema)
async def actualizar_evaluacion(
    evaluacion_id: int,
    evaluacion: EvaluacionComiteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([
        RolUsuario.COMITE_EXPERTOS, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR
    ]))
):
    """Actualizar una evaluación"""
    db_evaluacion = db.query(EvaluacionComite).filter(
        EvaluacionComite.id == evaluacion_id
    ).first()

    if not db_evaluacion:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")

    # Solo el evaluador original o admin puede editar
    if current_user.rol != RolUsuario.ADMINISTRADOR:
        if db_evaluacion.evaluador_id != current_user.id:
            raise HTTPException(status_code=403, detail="No tiene permisos para editar esta evaluación")

    update_data = evaluacion.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_evaluacion, key, value)

    # Recalcular subtotales
    db_evaluacion.dim1_subtotal = (
        db_evaluacion.dim1_claridad_problema +
        db_evaluacion.dim1_beneficios_cuantificados +
        db_evaluacion.dim1_alineacion_estrategica
    )
    db_evaluacion.dim2_subtotal = (
        db_evaluacion.dim2_arquitectura +
        db_evaluacion.dim2_integracion +
        db_evaluacion.dim2_seguridad +
        db_evaluacion.dim2_escalabilidad
    )
    db_evaluacion.dim3_subtotal = (
        db_evaluacion.dim3_presupuesto_detallado +
        db_evaluacion.dim3_roi_tco +
        db_evaluacion.dim3_riesgos_financieros
    )

    db_evaluacion.puntaje_total = (
        db_evaluacion.dim1_subtotal +
        db_evaluacion.dim2_subtotal +
        db_evaluacion.dim3_subtotal
    )

    db_evaluacion.aprobado = (
        float(db_evaluacion.puntaje_total) >= settings.UMBRAL_APROBACION_COMITE and
        not db_evaluacion.veto
    )

    db_evaluacion.fecha_revision = datetime.utcnow()

    db.commit()
    db.refresh(db_evaluacion)

    return db_evaluacion


@router.post("/iniciativa/{iniciativa_id}/cerrar-evaluacion")
async def cerrar_evaluacion(
    iniciativa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(check_role([RolUsuario.JEFE_TD, RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]))
):
    """Cerrar evaluación y determinar resultado final"""
    iniciativa = db.query(Iniciativa).filter(Iniciativa.id == iniciativa_id).first()

    if not iniciativa:
        raise HTTPException(status_code=404, detail="Iniciativa no encontrada")

    if iniciativa.estado != EstadoIniciativa.EN_EVALUACION:
        raise HTTPException(status_code=400, detail="La iniciativa no está en evaluación")

    # Obtener evaluaciones
    evaluaciones = db.query(EvaluacionComite).filter(
        EvaluacionComite.iniciativa_id == iniciativa_id
    ).all()

    if not evaluaciones:
        raise HTTPException(status_code=400, detail="No hay evaluaciones para cerrar")

    # Verificar si alguna tiene veto
    tiene_veto = any(e.veto for e in evaluaciones)

    if tiene_veto:
        iniciativa.estado = EstadoIniciativa.RECHAZADA
        mensaje = "Iniciativa rechazada por veto del comité"
    else:
        # Calcular promedio de puntajes
        promedio = sum(float(e.puntaje_total) for e in evaluaciones) / len(evaluaciones)

        if promedio >= settings.UMBRAL_APROBACION_COMITE:
            iniciativa.estado = EstadoIniciativa.APROBADA
            iniciativa.fecha_aprobacion = datetime.utcnow()

            # Crear proyecto en banco de reserva
            proyecto = Proyecto(
                iniciativa_id=iniciativa.id,
                codigo_proyecto=f"PRY-{iniciativa.codigo.replace('INI-', '')}",
                nombre=iniciativa.titulo,
                descripcion=iniciativa.descripcion,
                estado=EstadoProyecto.BANCO_RESERVA,
                presupuesto_asignado=iniciativa.monto_estimado
            )
            db.add(proyecto)

            mensaje = f"Iniciativa aprobada con puntaje promedio de {promedio:.1f}. Proyecto creado en banco de reserva."
        else:
            iniciativa.estado = EstadoIniciativa.RECHAZADA
            mensaje = f"Iniciativa rechazada. Puntaje promedio: {promedio:.1f} (mínimo requerido: {settings.UMBRAL_APROBACION_COMITE})"

    db.commit()

    return {"mensaje": mensaje, "estado": iniciativa.estado.value}
