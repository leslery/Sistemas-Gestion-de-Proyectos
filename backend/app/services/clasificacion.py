from decimal import Decimal
from typing import List, Dict
from sqlalchemy.orm import Session

from ..models.presupuesto import ClasificacionFinanciera, ClasificacionNIIF
from ..config import settings


class ClasificacionService:
    """Servicio para clasificación financiera NIIF"""

    # Matrices de clasificación por tipo de gasto
    MATRIZ_CLASIFICACION = {
        # Software y desarrollo
        "desarrollo_software": ClasificacionNIIF.CAPEX_INTANGIBLE,
        "licencias_perpetuas": ClasificacionNIIF.CAPEX_INTANGIBLE,
        "licencias_saas": ClasificacionNIIF.OPEX,
        "licencias_saas_largo_plazo": ClasificacionNIIF.DERECHO_USO,  # Si > 1 año y > umbral

        # Hardware e infraestructura
        "servidores": ClasificacionNIIF.CAPEX_TANGIBLE,
        "equipos_red": ClasificacionNIIF.CAPEX_TANGIBLE,
        "equipos_computo": ClasificacionNIIF.CAPEX_TANGIBLE,

        # Servicios
        "consultoria": ClasificacionNIIF.OPEX,
        "capacitacion": ClasificacionNIIF.OPEX,
        "soporte_mantenimiento": ClasificacionNIIF.OPEX,

        # Arrendamientos
        "arrendamiento_equipos": ClasificacionNIIF.DERECHO_USO,
        "arrendamiento_datacenter": ClasificacionNIIF.DERECHO_USO,
    }

    @classmethod
    def clasificar_gasto(
        cls,
        tipo_gasto: str,
        monto: Decimal,
        duracion_meses: int = 12
    ) -> ClasificacionNIIF:
        """
        Clasifica un gasto según NIIF

        Reglas:
        - CAPEX > $500,000 CLP
        - NIIF 16 > $5,000,000 CLP y duración > 12 meses
        - OPEX: resto
        """
        monto_float = float(monto)
        umbral_capex = settings.UMBRAL_CAPEX
        umbral_niif16 = settings.UMBRAL_NIIF16

        # Verificar si está en la matriz
        tipo_normalizado = tipo_gasto.lower().replace(" ", "_")
        clasificacion_base = cls.MATRIZ_CLASIFICACION.get(
            tipo_normalizado,
            ClasificacionNIIF.OPEX
        )

        # Aplicar reglas de umbrales
        if clasificacion_base in [ClasificacionNIIF.CAPEX_INTANGIBLE, ClasificacionNIIF.CAPEX_TANGIBLE]:
            if monto_float < umbral_capex:
                return ClasificacionNIIF.OPEX

        if clasificacion_base == ClasificacionNIIF.DERECHO_USO:
            if monto_float < umbral_niif16 or duracion_meses <= 12:
                return ClasificacionNIIF.OPEX

        return clasificacion_base

    @classmethod
    def clasificar_proyecto(
        cls,
        db: Session,
        proyecto_id: int,
        gastos: List[Dict]
    ) -> Dict:
        """
        Clasifica todos los gastos de un proyecto y genera resumen

        gastos: Lista de diccionarios con {tipo_gasto, descripcion, monto, duracion_meses}
        """
        clasificaciones = []
        resumen = {
            ClasificacionNIIF.CAPEX_INTANGIBLE: Decimal(0),
            ClasificacionNIIF.CAPEX_TANGIBLE: Decimal(0),
            ClasificacionNIIF.DERECHO_USO: Decimal(0),
            ClasificacionNIIF.OPEX: Decimal(0),
        }

        for gasto in gastos:
            clasificacion = cls.clasificar_gasto(
                gasto["tipo_gasto"],
                Decimal(str(gasto["monto"])),
                gasto.get("duracion_meses", 12)
            )

            # Crear registro de clasificación
            clf = ClasificacionFinanciera(
                proyecto_id=proyecto_id,
                tipo_gasto=gasto["tipo_gasto"],
                descripcion=gasto.get("descripcion"),
                clasificacion_niif=clasificacion,
                monto=Decimal(str(gasto["monto"])),
                justificacion=f"Clasificado automáticamente según matriz NIIF"
            )
            db.add(clf)
            clasificaciones.append(clf)

            # Actualizar resumen
            resumen[clasificacion] += Decimal(str(gasto["monto"]))

        db.commit()

        return {
            "clasificaciones": clasificaciones,
            "resumen": {k.value: float(v) for k, v in resumen.items()},
            "total_capex": float(
                resumen[ClasificacionNIIF.CAPEX_INTANGIBLE] +
                resumen[ClasificacionNIIF.CAPEX_TANGIBLE]
            ),
            "total_derecho_uso": float(resumen[ClasificacionNIIF.DERECHO_USO]),
            "total_opex": float(resumen[ClasificacionNIIF.OPEX])
        }

    @staticmethod
    def obtener_justificacion_niif(clasificacion: ClasificacionNIIF) -> str:
        """Retorna la justificación normativa para cada clasificación"""
        justificaciones = {
            ClasificacionNIIF.CAPEX_INTANGIBLE: (
                "NIC 38 - Activos Intangibles: Recurso identificable, de carácter no monetario "
                "y sin sustancia física, que se espera proporcione beneficios económicos futuros."
            ),
            ClasificacionNIIF.CAPEX_TANGIBLE: (
                "NIC 16 - Propiedades, Planta y Equipo: Activos tangibles que se mantienen para "
                "su uso en la producción o suministro de bienes y servicios."
            ),
            ClasificacionNIIF.DERECHO_USO: (
                "NIIF 16 - Arrendamientos: Derecho a usar un activo subyacente durante el "
                "plazo del arrendamiento, reconocido cuando el contrato es > 12 meses y "
                "> $5,000,000 CLP."
            ),
            ClasificacionNIIF.OPEX: (
                "NIC 1 - Presentación de Estados Financieros: Gasto que no cumple criterios "
                "de capitalización y se reconoce en el resultado del período."
            ),
        }
        return justificaciones.get(clasificacion, "Sin justificación definida")
