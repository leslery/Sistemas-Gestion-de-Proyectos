from decimal import Decimal
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from ..models.iniciativa import (
    Iniciativa, ScoringIniciativa, Prioridad,
    ClasificacionInversion, TipoInforme
)
from ..config import settings


class ScoringService:
    """Servicio para calcular el scoring automático de iniciativas"""

    @staticmethod
    def calcular_prioridad(puntaje_total: int) -> Prioridad:
        """
        Calcula la prioridad basada en el puntaje total (0-38 puntos)
        P1: 32-38 puntos (Muy Alta)
        P2: 25-31 puntos (Alta)
        P3: 18-24 puntos (Media)
        P4: 11-17 puntos (Baja)
        P5: 0-10 puntos (Muy Baja)
        """
        if puntaje_total >= 32:
            return Prioridad.P1
        elif puntaje_total >= 25:
            return Prioridad.P2
        elif puntaje_total >= 18:
            return Prioridad.P3
        elif puntaje_total >= 11:
            return Prioridad.P4
        else:
            return Prioridad.P5

    @staticmethod
    def calcular_clasificacion_inversion(
        monto: Decimal,
        porcentaje_transformacion: int
    ) -> Tuple[ClasificacionInversion, TipoInforme]:
        """
        Clasifica la inversión según monto y porcentaje de transformación
        """
        monto_float = float(monto)
        umbral_estandar = settings.UMBRAL_ESTANDAR
        umbral_alta = settings.UMBRAL_ALTA

        if monto_float > umbral_alta:
            # Estratégica (> 1500M)
            return ClasificacionInversion.ESTRATEGICA, TipoInforme.V3
        elif monto_float > umbral_estandar:
            # Alta inversión (300M - 1500M)
            if porcentaje_transformacion < 25:
                return ClasificacionInversion.ALTA_A, TipoInforme.V2
            elif porcentaje_transformacion <= 75:
                return ClasificacionInversion.ALTA_B, TipoInforme.V2
            else:
                return ClasificacionInversion.ALTA_C, TipoInforme.V2
        else:
            # Estándar (< 300M)
            if porcentaje_transformacion < 50:
                return ClasificacionInversion.ESTANDAR_A, TipoInforme.V1
            else:
                return ClasificacionInversion.ESTANDAR_B, TipoInforme.V1

    @staticmethod
    def calcular_scoring(scoring: ScoringIniciativa) -> int:
        """
        Calcula el puntaje total del scoring
        Máximo 38 puntos:
        - Dimensión A (Impacto Estratégico): 0-12 pts
        - Dimensión B (Impacto Operacional): 0-10 pts
        - Dimensión C (Urgencia y Viabilidad): 0-16 pts
        """
        dim_a_total = min(scoring.dim_a_focos, 4) + min(scoring.dim_a_profundidad, 8)
        dim_b_total = min(scoring.dim_b_beneficio, 6) + min(scoring.dim_b_alcance, 4)
        dim_c_total = min(scoring.dim_c_urgencia, 8) + min(scoring.dim_c_viabilidad, 8)

        return dim_a_total + dim_b_total + dim_c_total

    @classmethod
    def procesar_iniciativa(
        cls,
        db: Session,
        iniciativa: Iniciativa,
        scoring_data: Optional[dict] = None
    ) -> Iniciativa:
        """
        Procesa una iniciativa: calcula scoring, clasificación y prioridad
        """
        # Calcular clasificación de inversión
        clasificacion, tipo_informe = cls.calcular_clasificacion_inversion(
            iniciativa.monto_estimado,
            iniciativa.porcentaje_transformacion
        )
        iniciativa.clasificacion_inversion = clasificacion
        iniciativa.tipo_informe = tipo_informe

        # Si hay datos de scoring, calcular
        if scoring_data:
            scoring = iniciativa.scoring
            if not scoring:
                scoring = ScoringIniciativa(iniciativa_id=iniciativa.id)
                db.add(scoring)

            # Actualizar valores de scoring
            for key, value in scoring_data.items():
                if hasattr(scoring, key):
                    setattr(scoring, key, value)

            # Calcular puntaje total
            puntaje = cls.calcular_scoring(scoring)
            scoring.puntaje_total = puntaje
            scoring.prioridad_calculada = cls.calcular_prioridad(puntaje)

            # Actualizar iniciativa
            iniciativa.puntaje_total = puntaje
            iniciativa.prioridad = scoring.prioridad_calculada

        db.commit()
        db.refresh(iniciativa)

        return iniciativa

    @staticmethod
    def calcular_puntaje_comite(evaluacion) -> Tuple[Decimal, bool]:
        """
        Calcula el puntaje total de la evaluación del comité
        Umbral de aprobación: >= 80 puntos
        """
        # Dimensión 1: Subtotal (máx 35)
        dim1 = (
            evaluacion.dim1_claridad_problema +
            evaluacion.dim1_beneficios_cuantificados +
            evaluacion.dim1_alineacion_estrategica
        )

        # Dimensión 2: Subtotal (máx 40)
        dim2 = (
            evaluacion.dim2_arquitectura +
            evaluacion.dim2_integracion +
            evaluacion.dim2_seguridad +
            evaluacion.dim2_escalabilidad
        )

        # Dimensión 3: Subtotal (máx 25)
        dim3 = (
            evaluacion.dim3_presupuesto_detallado +
            evaluacion.dim3_roi_tco +
            evaluacion.dim3_riesgos_financieros
        )

        puntaje_total = dim1 + dim2 + dim3
        aprobado = puntaje_total >= settings.UMBRAL_APROBACION_COMITE and not evaluacion.veto

        return puntaje_total, aprobado
