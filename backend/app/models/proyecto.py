from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Enum, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class EstadoProyecto(str, enum.Enum):
    BANCO_RESERVA = "banco_reserva"
    PLAN_ANUAL = "plan_anual"
    EN_EJECUCION = "en_ejecucion"
    PAUSADO = "pausado"
    CANCELADO = "cancelado"
    COMPLETADO = "completado"


class EstadoFase(str, enum.Enum):
    PENDIENTE = "pendiente"
    EN_PROGRESO = "en_progreso"
    COMPLETADA = "completada"
    RETRASADA = "retrasada"


class SemaforoSalud(str, enum.Enum):
    VERDE = "verde"
    AMARILLO = "amarillo"
    ROJO = "rojo"


class NivelRiesgo(str, enum.Enum):
    BAJO = "bajo"
    MEDIO = "medio"
    ALTO = "alto"


class SeveridadIssue(str, enum.Enum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class TipoBitacora(str, enum.Enum):
    DECISION = "decision"
    CAMBIO = "cambio"
    NOTA = "nota"
    ESCALAMIENTO = "escalamiento"


class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    iniciativa_id = Column(Integer, ForeignKey("iniciativas.id"), unique=True, nullable=False)
    codigo_proyecto = Column(String(30), unique=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)

    # Estado y planificación
    estado = Column(Enum(EstadoProyecto), default=EstadoProyecto.BANCO_RESERVA)
    año_plan = Column(Integer)
    semaforo_salud = Column(Enum(SemaforoSalud), default=SemaforoSalud.VERDE)

    # Presupuesto asignado
    presupuesto_asignado = Column(Numeric(15, 2), default=0)

    # Fechas
    fecha_activacion = Column(DateTime)
    fecha_inicio_planificada = Column(DateTime)
    fecha_fin_planificada = Column(DateTime)
    fecha_inicio_real = Column(DateTime)
    fecha_fin_real = Column(DateTime)
    fecha_cierre = Column(DateTime)

    # Avance
    avance_porcentaje = Column(Integer, default=0)

    # Responsable
    responsable_id = Column(Integer, ForeignKey("usuarios.id"))

    # Cierre
    lecciones_aprendidas = Column(Text)
    metricas_exito = Column(Text)

    # Auditoría
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    iniciativa = relationship("Iniciativa", back_populates="proyecto")
    fases = relationship("FaseProyecto", back_populates="proyecto", order_by="FaseProyecto.orden")
    hitos = relationship("HitoProyecto", back_populates="proyecto")
    riesgos = relationship("RiesgoProyecto", back_populates="proyecto")
    issues = relationship("IssueProyecto", back_populates="proyecto")
    bitacora = relationship("BitacoraProyecto", back_populates="proyecto", order_by="BitacoraProyecto.fecha.desc()")
    ejecuciones_mensuales = relationship("EjecucionMensual", back_populates="proyecto")
    presupuesto = relationship("PresupuestoProyecto", back_populates="proyecto", uselist=False)
    clasificaciones_financieras = relationship("ClasificacionFinanciera", back_populates="proyecto")
    cambios_presupuesto = relationship("CambioPresupuesto", back_populates="proyecto")
    planes_anuales = relationship("PlanAnualProyecto", back_populates="proyecto")


class FaseProyecto(Base):
    __tablename__ = "fases_proyecto"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    orden = Column(Integer, default=1)

    # Fechas planificadas
    fecha_inicio_planificada = Column(DateTime)
    fecha_fin_planificada = Column(DateTime)

    # Fechas reales
    fecha_inicio_real = Column(DateTime)
    fecha_fin_real = Column(DateTime)

    # Estado y avance
    avance_porcentaje = Column(Integer, default=0)
    estado = Column(Enum(EstadoFase), default=EstadoFase.PENDIENTE)

    # Responsable
    responsable_id = Column(Integer, ForeignKey("usuarios.id"))

    # Relationships
    proyecto = relationship("Proyecto", back_populates="fases")
    hitos = relationship("HitoProyecto", back_populates="fase")


class HitoProyecto(Base):
    __tablename__ = "hitos_proyecto"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)
    fase_id = Column(Integer, ForeignKey("fases_proyecto.id"))
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)

    # Fechas
    fecha_planificada = Column(DateTime, nullable=False)
    fecha_real = Column(DateTime)

    # Estado
    completado = Column(Boolean, default=False)
    evidencia_url = Column(String(500))

    # Relationships
    proyecto = relationship("Proyecto", back_populates="hitos")
    fase = relationship("FaseProyecto", back_populates="hitos")


class RiesgoProyecto(Base):
    __tablename__ = "riesgos_proyecto"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)
    descripcion = Column(Text, nullable=False)

    # Evaluación
    probabilidad = Column(Enum(NivelRiesgo), default=NivelRiesgo.MEDIO)
    impacto = Column(Enum(NivelRiesgo), default=NivelRiesgo.MEDIO)

    # Mitigación
    mitigacion = Column(Text)
    plan_contingencia = Column(Text)

    # Estado
    estado = Column(String(20), default="abierto")  # abierto, mitigado, cerrado
    responsable_id = Column(Integer, ForeignKey("usuarios.id"))

    # Fechas
    fecha_identificacion = Column(DateTime, default=datetime.utcnow)
    fecha_cierre = Column(DateTime)

    # Relationships
    proyecto = relationship("Proyecto", back_populates="riesgos")


class IssueProyecto(Base):
    __tablename__ = "issues_proyecto"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)

    # Clasificación
    severidad = Column(Enum(SeveridadIssue), default=SeveridadIssue.MEDIA)
    estado = Column(String(20), default="abierto")  # abierto, en_progreso, resuelto

    # Responsable
    responsable_id = Column(Integer, ForeignKey("usuarios.id"))

    # Resolución
    resolucion = Column(Text)

    # Fechas
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_resolucion = Column(DateTime)

    # Relationships
    proyecto = relationship("Proyecto", back_populates="issues")


class BitacoraProyecto(Base):
    __tablename__ = "bitacora_proyecto"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    tipo = Column(Enum(TipoBitacora), default=TipoBitacora.NOTA)
    descripcion = Column(Text, nullable=False)

    fecha = Column(DateTime, default=datetime.utcnow)

    # Relationships
    proyecto = relationship("Proyecto", back_populates="bitacora")
    usuario = relationship("Usuario", back_populates="bitacora_entries")


class EjecucionMensual(Base):
    __tablename__ = "ejecucion_mensual"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)
    año = Column(Integer, nullable=False)
    mes = Column(Integer, nullable=False)  # 1-12

    # Presupuesto
    capex_planificado = Column(Numeric(15, 2), default=0)
    capex_ejecutado = Column(Numeric(15, 2), default=0)

    # Avance
    avance_planificado = Column(Integer, default=0)  # Porcentaje
    avance_real = Column(Integer, default=0)  # Porcentaje

    comentarios = Column(Text)

    # Relationships
    proyecto = relationship("Proyecto", back_populates="ejecuciones_mensuales")
