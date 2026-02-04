from decimal import Decimal
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from ..models.proyecto import Proyecto, EstadoProyecto, SemaforoSalud
from ..models.iniciativa import Iniciativa, EstadoIniciativa, Prioridad, ClasificacionInversion
from ..models.presupuesto import PresupuestoProyecto
from ..models.planificacion import PlanAnual


class ReportesService:
    """Servicio para generación de reportes y dashboards"""

    @staticmethod
    def obtener_kpis_portfolio(db: Session, año: Optional[int] = None) -> Dict:
        """Obtiene KPIs principales del portfolio"""
        filtro_año = Proyecto.año_plan == año if año else True

        # Total de proyectos por estado
        proyectos_por_estado = dict(
            db.query(Proyecto.estado, func.count(Proyecto.id))
            .filter(filtro_año)
            .group_by(Proyecto.estado)
            .all()
        )

        # Presupuesto total
        presupuesto_stats = db.query(
            func.sum(PresupuestoProyecto.capex_aprobado),
            func.sum(PresupuestoProyecto.capex_comprometido),
            func.sum(PresupuestoProyecto.capex_ejecutado),
            func.sum(PresupuestoProyecto.opex_proyectado_anual)
        ).join(Proyecto).filter(filtro_año).first()

        # Semáforo consolidado
        semaforo_stats = dict(
            db.query(Proyecto.semaforo_salud, func.count(Proyecto.id))
            .filter(filtro_año, Proyecto.estado == EstadoProyecto.EN_EJECUCION)
            .group_by(Proyecto.semaforo_salud)
            .all()
        )

        return {
            "total_proyectos": sum(proyectos_por_estado.values()),
            "proyectos_por_estado": {k.value: v for k, v in proyectos_por_estado.items()},
            "presupuesto": {
                "capex_aprobado": float(presupuesto_stats[0] or 0),
                "capex_comprometido": float(presupuesto_stats[1] or 0),
                "capex_ejecutado": float(presupuesto_stats[2] or 0),
                "opex_proyectado": float(presupuesto_stats[3] or 0)
            },
            "semaforo": {
                "verde": semaforo_stats.get(SemaforoSalud.VERDE, 0),
                "amarillo": semaforo_stats.get(SemaforoSalud.AMARILLO, 0),
                "rojo": semaforo_stats.get(SemaforoSalud.ROJO, 0)
            }
        }

    @staticmethod
    def obtener_funnel_iniciativas(db: Session) -> Dict:
        """Obtiene el funnel de iniciativas para el pipeline"""
        estados_funnel = [
            EstadoIniciativa.ENVIADA,
            EstadoIniciativa.EN_REVISION,
            EstadoIniciativa.EN_EVALUACION,
            EstadoIniciativa.APROBADA,
            EstadoIniciativa.EN_BANCO_RESERVA,
            EstadoIniciativa.EN_PLAN_ANUAL,
            EstadoIniciativa.ACTIVADA
        ]

        funnel = {}
        for estado in estados_funnel:
            count = db.query(func.count(Iniciativa.id)).filter(
                Iniciativa.estado == estado
            ).scalar()
            funnel[estado.value] = count

        return {
            "funnel": funnel,
            "total": sum(funnel.values())
        }

    @staticmethod
    def obtener_distribucion_clasificacion(db: Session) -> Dict:
        """Obtiene distribución por clasificación de inversión"""
        distribucion = dict(
            db.query(Iniciativa.clasificacion_inversion, func.count(Iniciativa.id))
            .filter(Iniciativa.clasificacion_inversion.isnot(None))
            .group_by(Iniciativa.clasificacion_inversion)
            .all()
        )

        return {k.value: v for k, v in distribucion.items()}

    @staticmethod
    def obtener_proyectos_criticos(db: Session, limite: int = 5) -> List[Dict]:
        """Obtiene los proyectos más críticos (en riesgo)"""
        proyectos = db.query(Proyecto).filter(
            Proyecto.estado == EstadoProyecto.EN_EJECUCION,
            Proyecto.semaforo_salud.in_([SemaforoSalud.AMARILLO, SemaforoSalud.ROJO])
        ).order_by(
            Proyecto.semaforo_salud.desc()
        ).limit(limite).all()

        resultado = []
        for p in proyectos:
            presupuesto = db.query(PresupuestoProyecto).filter(
                PresupuestoProyecto.proyecto_id == p.id
            ).first()

            desviacion = 0
            if presupuesto and presupuesto.capex_aprobado > 0:
                desviacion = float(
                    (presupuesto.capex_ejecutado - presupuesto.capex_comprometido) /
                    presupuesto.capex_aprobado * 100
                )

            resultado.append({
                "id": p.id,
                "codigo": p.codigo_proyecto,
                "nombre": p.nombre,
                "semaforo": p.semaforo_salud.value,
                "avance": p.avance_porcentaje,
                "desviacion_presupuesto": round(desviacion, 2)
            })

        return resultado

    @staticmethod
    def obtener_banco_reserva_stats(db: Session) -> Dict:
        """Obtiene estadísticas del banco de reserva"""
        proyectos = db.query(Proyecto).join(Iniciativa).filter(
            Proyecto.estado == EstadoProyecto.BANCO_RESERVA
        ).all()

        por_prioridad = {}
        monto_total = Decimal(0)

        for p in proyectos:
            prioridad = p.iniciativa.prioridad.value if p.iniciativa.prioridad else "sin_prioridad"
            if prioridad not in por_prioridad:
                por_prioridad[prioridad] = {"cantidad": 0, "monto": 0}
            por_prioridad[prioridad]["cantidad"] += 1
            por_prioridad[prioridad]["monto"] += float(p.presupuesto_asignado or 0)
            monto_total += p.presupuesto_asignado or Decimal(0)

        return {
            "total_proyectos": len(proyectos),
            "monto_total": float(monto_total),
            "por_prioridad": por_prioridad
        }

    @staticmethod
    def obtener_ejecucion_presupuestaria(
        db: Session,
        año: int,
        agrupacion: str = "mensual"
    ) -> Dict:
        """Obtiene la ejecución presupuestaria por período"""
        from ..models.proyecto import EjecucionMensual

        query = db.query(
            EjecucionMensual.mes,
            func.sum(EjecucionMensual.capex_planificado),
            func.sum(EjecucionMensual.capex_ejecutado)
        ).filter(
            EjecucionMensual.año == año
        ).group_by(
            EjecucionMensual.mes
        ).order_by(
            EjecucionMensual.mes
        ).all()

        datos = []
        acum_plan = 0
        acum_ejec = 0

        for mes, planificado, ejecutado in query:
            plan = float(planificado or 0)
            ejec = float(ejecutado or 0)
            acum_plan += plan
            acum_ejec += ejec

            datos.append({
                "mes": mes,
                "planificado": plan,
                "ejecutado": ejec,
                "planificado_acumulado": acum_plan,
                "ejecutado_acumulado": acum_ejec
            })

        # Plan anual
        plan_anual = db.query(PlanAnual).filter(PlanAnual.año == año).first()

        return {
            "año": año,
            "datos": datos,
            "presupuesto_anual": float(plan_anual.presupuesto_total) if plan_anual else 0,
            "total_planificado": acum_plan,
            "total_ejecutado": acum_ejec,
            "porcentaje_ejecucion": round(acum_ejec / acum_plan * 100, 2) if acum_plan > 0 else 0
        }

    @staticmethod
    def obtener_dashboard_ejecutivo(db: Session, año: Optional[int] = None) -> Dict:
        """Genera el dashboard ejecutivo completo"""
        año_actual = año or datetime.now().year

        return {
            "kpis": ReportesService.obtener_kpis_portfolio(db, año_actual),
            "funnel": ReportesService.obtener_funnel_iniciativas(db),
            "distribucion_clasificacion": ReportesService.obtener_distribucion_clasificacion(db),
            "proyectos_criticos": ReportesService.obtener_proyectos_criticos(db),
            "banco_reserva": ReportesService.obtener_banco_reserva_stats(db),
            "ejecucion": ReportesService.obtener_ejecucion_presupuestaria(db, año_actual),
            "fecha_generacion": datetime.utcnow().isoformat()
        }
