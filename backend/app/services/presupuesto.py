from decimal import Decimal
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models.proyecto import Proyecto, EjecucionMensual
from ..models.presupuesto import (
    PresupuestoProyecto, CambioPresupuesto,
    EstadoCambio, TipoCambioPresupuesto
)


class PresupuestoService:
    """Servicio para gestión de presupuesto CAPEX/OPEX"""

    @staticmethod
    def crear_presupuesto_proyecto(
        db: Session,
        proyecto_id: int,
        capex_aprobado: Decimal,
        opex_proyectado: Decimal = Decimal(0),
        aprobado_por: Optional[int] = None
    ) -> PresupuestoProyecto:
        """Crea el registro de presupuesto inicial de un proyecto"""
        presupuesto = PresupuestoProyecto(
            proyecto_id=proyecto_id,
            capex_aprobado=capex_aprobado,
            opex_proyectado_anual=opex_proyectado,
            fecha_aprobacion=datetime.utcnow() if aprobado_por else None,
            aprobado_por=aprobado_por
        )
        db.add(presupuesto)
        db.commit()
        db.refresh(presupuesto)
        return presupuesto

    @staticmethod
    def solicitar_cambio_presupuesto(
        db: Session,
        proyecto_id: int,
        tipo: TipoCambioPresupuesto,
        monto_solicitado: Decimal,
        justificacion: str,
        solicitado_por: int
    ) -> CambioPresupuesto:
        """Crea una solicitud de cambio de presupuesto"""
        cambio = CambioPresupuesto(
            proyecto_id=proyecto_id,
            tipo=tipo,
            monto_solicitado=monto_solicitado,
            justificacion=justificacion,
            solicitado_por=solicitado_por
        )
        db.add(cambio)
        db.commit()
        db.refresh(cambio)
        return cambio

    @staticmethod
    def aprobar_cambio_presupuesto(
        db: Session,
        cambio_id: int,
        monto_aprobado: Decimal,
        aprobado_por: int,
        observaciones: Optional[str] = None
    ) -> CambioPresupuesto:
        """Aprueba un cambio de presupuesto y actualiza el presupuesto del proyecto"""
        cambio = db.query(CambioPresupuesto).filter(
            CambioPresupuesto.id == cambio_id
        ).first()

        if not cambio:
            raise ValueError("Cambio de presupuesto no encontrado")

        cambio.estado = EstadoCambio.APROBADO
        cambio.monto_aprobado = monto_aprobado
        cambio.aprobado_por = aprobado_por
        cambio.fecha_resolucion = datetime.utcnow()
        cambio.observaciones = observaciones

        # Actualizar presupuesto del proyecto
        presupuesto = db.query(PresupuestoProyecto).filter(
            PresupuestoProyecto.proyecto_id == cambio.proyecto_id
        ).first()

        if presupuesto:
            if cambio.tipo == TipoCambioPresupuesto.AUMENTO:
                presupuesto.capex_aprobado += monto_aprobado
            elif cambio.tipo == TipoCambioPresupuesto.REDUCCION:
                presupuesto.capex_aprobado -= monto_aprobado

        db.commit()
        db.refresh(cambio)
        return cambio

    @staticmethod
    def rechazar_cambio_presupuesto(
        db: Session,
        cambio_id: int,
        aprobado_por: int,
        observaciones: str
    ) -> CambioPresupuesto:
        """Rechaza un cambio de presupuesto"""
        cambio = db.query(CambioPresupuesto).filter(
            CambioPresupuesto.id == cambio_id
        ).first()

        if not cambio:
            raise ValueError("Cambio de presupuesto no encontrado")

        cambio.estado = EstadoCambio.RECHAZADO
        cambio.aprobado_por = aprobado_por
        cambio.fecha_resolucion = datetime.utcnow()
        cambio.observaciones = observaciones

        db.commit()
        db.refresh(cambio)
        return cambio

    @staticmethod
    def registrar_ejecucion(
        db: Session,
        proyecto_id: int,
        año: int,
        mes: int,
        capex_ejecutado: Decimal,
        avance_real: int,
        capex_planificado: Decimal = Decimal(0),
        avance_planificado: int = 0,
        comentarios: Optional[str] = None
    ) -> EjecucionMensual:
        """Registra la ejecución mensual de un proyecto (plan y real)"""
        from ..models.proyecto import Proyecto

        # Validar que el proyecto existe
        proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
        if not proyecto:
            raise ValueError(f"Proyecto con ID {proyecto_id} no encontrado")

        # Buscar si ya existe registro para el mes
        ejecucion = db.query(EjecucionMensual).filter(
            EjecucionMensual.proyecto_id == proyecto_id,
            EjecucionMensual.año == año,
            EjecucionMensual.mes == mes
        ).first()

        if ejecucion:
            ejecucion.capex_planificado = capex_planificado
            ejecucion.capex_ejecutado = capex_ejecutado
            ejecucion.avance_planificado = avance_planificado
            ejecucion.avance_real = avance_real
            ejecucion.comentarios = comentarios
        else:
            ejecucion = EjecucionMensual(
                proyecto_id=proyecto_id,
                año=año,
                mes=mes,
                capex_planificado=capex_planificado,
                capex_ejecutado=capex_ejecutado,
                avance_planificado=avance_planificado,
                avance_real=avance_real,
                comentarios=comentarios
            )
            db.add(ejecucion)

        # Actualizar presupuesto total ejecutado
        presupuesto = db.query(PresupuestoProyecto).filter(
            PresupuestoProyecto.proyecto_id == proyecto_id
        ).first()

        if presupuesto:
            total_ejecutado = db.query(func.sum(EjecucionMensual.capex_ejecutado)).filter(
                EjecucionMensual.proyecto_id == proyecto_id
            ).scalar() or Decimal(0)
            presupuesto.capex_ejecutado = total_ejecutado

        db.commit()
        db.refresh(ejecucion)
        return ejecucion

    @staticmethod
    def obtener_curva_s(
        db: Session,
        proyecto_id: int
    ) -> Dict:
        """Genera datos para la curva S de ejecución"""
        ejecuciones = db.query(EjecucionMensual).filter(
            EjecucionMensual.proyecto_id == proyecto_id
        ).order_by(EjecucionMensual.año, EjecucionMensual.mes).all()

        presupuesto = db.query(PresupuestoProyecto).filter(
            PresupuestoProyecto.proyecto_id == proyecto_id
        ).first()

        capex_aprobado = float(presupuesto.capex_aprobado) if presupuesto else 0

        # Construir datos de la curva
        datos = []
        acumulado_planificado = Decimal(0)
        acumulado_ejecutado = Decimal(0)

        for ej in ejecuciones:
            acumulado_planificado += ej.capex_planificado or Decimal(0)
            acumulado_ejecutado += ej.capex_ejecutado or Decimal(0)

            datos.append({
                "periodo": f"{ej.año}-{ej.mes:02d}",
                "planificado_mensual": float(ej.capex_planificado or 0),
                "ejecutado_mensual": float(ej.capex_ejecutado or 0),
                "planificado_acumulado": float(acumulado_planificado),
                "ejecutado_acumulado": float(acumulado_ejecutado),
                "avance_planificado": ej.avance_planificado,
                "avance_real": ej.avance_real
            })

        # Calcular variaciones
        variacion_costo = 0
        if acumulado_planificado > 0:
            variacion_costo = float(
                (acumulado_ejecutado - acumulado_planificado) / acumulado_planificado * 100
            )

        return {
            "datos": datos,
            "capex_aprobado": capex_aprobado,
            "total_planificado": float(acumulado_planificado),
            "total_ejecutado": float(acumulado_ejecutado),
            "variacion_costo_porcentaje": round(variacion_costo, 2),
            "forecast_cierre": float(acumulado_ejecutado) if datos else 0
        }

    @staticmethod
    def verificar_alertas_sobrecosto(
        db: Session,
        proyecto_id: int,
        umbral_alerta: float = 10.0
    ) -> Dict:
        """Verifica si el proyecto tiene alertas de sobrecosto"""
        presupuesto = db.query(PresupuestoProyecto).filter(
            PresupuestoProyecto.proyecto_id == proyecto_id
        ).first()

        if not presupuesto or presupuesto.capex_aprobado == 0:
            return {"tiene_alerta": False, "mensaje": "Sin presupuesto definido"}

        porcentaje_ejecutado = float(
            presupuesto.capex_ejecutado / presupuesto.capex_aprobado * 100
        )

        # Comparar con avance del proyecto
        proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
        avance = proyecto.avance_porcentaje if proyecto else 0

        # Si se ha gastado más proporcionalmente que el avance
        diferencia = porcentaje_ejecutado - avance

        alertas = []
        if diferencia > umbral_alerta:
            alertas.append({
                "tipo": "sobrecosto",
                "severidad": "alta" if diferencia > 20 else "media",
                "mensaje": f"Sobrecosto de {diferencia:.1f}% respecto al avance"
            })

        if porcentaje_ejecutado > 90 and avance < 80:
            alertas.append({
                "tipo": "presupuesto_agotado",
                "severidad": "critica",
                "mensaje": "Presupuesto casi agotado con proyecto incompleto"
            })

        return {
            "tiene_alerta": len(alertas) > 0,
            "alertas": alertas,
            "porcentaje_ejecutado": round(porcentaje_ejecutado, 2),
            "avance_proyecto": avance
        }
