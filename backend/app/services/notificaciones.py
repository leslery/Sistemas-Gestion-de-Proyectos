from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session


class NotificacionesService:
    """Servicio para gestión de notificaciones"""

    # En una implementación real, esto se conectaría a un servicio de email
    # y/o a un sistema de notificaciones push

    @staticmethod
    def enviar_notificacion_nueva_iniciativa(
        db: Session,
        iniciativa_id: int,
        destinatarios: List[str]
    ) -> bool:
        """Notifica sobre una nueva iniciativa"""
        # Placeholder para implementación de email
        print(f"[NOTIFICACION] Nueva iniciativa #{iniciativa_id} - Destinatarios: {destinatarios}")
        return True

    @staticmethod
    def enviar_notificacion_evaluacion_pendiente(
        db: Session,
        iniciativa_id: int,
        evaluador_email: str
    ) -> bool:
        """Notifica a un evaluador sobre evaluación pendiente"""
        print(f"[NOTIFICACION] Evaluación pendiente - Iniciativa #{iniciativa_id} - Evaluador: {evaluador_email}")
        return True

    @staticmethod
    def enviar_notificacion_cambio_estado(
        db: Session,
        tipo_entidad: str,  # 'iniciativa' o 'proyecto'
        entidad_id: int,
        nuevo_estado: str,
        destinatarios: List[str]
    ) -> bool:
        """Notifica sobre un cambio de estado"""
        print(f"[NOTIFICACION] Cambio estado {tipo_entidad} #{entidad_id} -> {nuevo_estado}")
        return True

    @staticmethod
    def enviar_alerta_presupuesto(
        db: Session,
        proyecto_id: int,
        tipo_alerta: str,
        mensaje: str,
        destinatarios: List[str]
    ) -> bool:
        """Envía alerta de presupuesto"""
        print(f"[ALERTA] Proyecto #{proyecto_id} - {tipo_alerta}: {mensaje}")
        return True

    @staticmethod
    def enviar_notificacion_aprobacion_requerida(
        db: Session,
        tipo_solicitud: str,
        solicitud_id: int,
        aprobador_email: str
    ) -> bool:
        """Notifica sobre una aprobación requerida"""
        print(f"[NOTIFICACION] Aprobación requerida - {tipo_solicitud} #{solicitud_id} - Aprobador: {aprobador_email}")
        return True
