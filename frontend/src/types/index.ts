// Enums
export enum RolUsuario {
  DEMANDANTE = 'demandante',
  ANALISTA_TD = 'analista_td',
  JEFE_TD = 'jefe_td',
  COMITE_EXPERTOS = 'comite_expertos',
  CGEDX = 'cgedx',
  ADMINISTRADOR = 'administrador'
}

export enum EstadoIniciativa {
  BORRADOR = 'borrador',
  ENVIADA = 'enviada',
  EN_REVISION = 'en_revision',
  EN_EVALUACION = 'en_evaluacion',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  EN_BANCO_RESERVA = 'en_banco_reserva',
  EN_PLAN_ANUAL = 'en_plan_anual',
  ACTIVADA = 'activada'
}

export enum ClasificacionInversion {
  ESTANDAR_A = 'estandar_a',
  ESTANDAR_B = 'estandar_b',
  ALTA_A = 'alta_a',
  ALTA_B = 'alta_b',
  ALTA_C = 'alta_c',
  ESTRATEGICA = 'estrategica'
}

export enum Prioridad {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
  P5 = 'P5'
}

export enum EstadoProyecto {
  BANCO_RESERVA = 'banco_reserva',
  PLAN_ANUAL = 'plan_anual',
  EN_EJECUCION = 'en_ejecucion',
  PAUSADO = 'pausado',
  CANCELADO = 'cancelado',
  COMPLETADO = 'completado'
}

export enum SemaforoSalud {
  VERDE = 'verde',
  AMARILLO = 'amarillo',
  ROJO = 'rojo'
}

// Interfaces
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  area_id?: number;
  telefono?: string;
  cargo?: string;
  activo: boolean;
  ultimo_acceso?: string;
  created_at: string;
  area?: Area;
}

export interface Area {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activa: boolean;
  responsable_id?: number;
}

export interface Iniciativa {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  justificacion?: string;
  beneficios_esperados?: string;
  area_demandante_id: number;
  monto_estimado: number;
  porcentaje_transformacion: number;
  clasificacion_inversion?: ClasificacionInversion;
  tipo_informe?: string;
  prioridad?: Prioridad;
  puntaje_total: number;
  estado: EstadoIniciativa;
  fecha_solicitud: string;
  fecha_aprobacion?: string;
  urgencia: string;
  fecha_limite?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  scoring?: ScoringIniciativa;
  area_demandante_nombre?: string;
  creador_nombre?: string;
}

export interface ScoringIniciativa {
  id: number;
  iniciativa_id: number;
  dim_a_focos: number;
  dim_a_profundidad: number;
  dim_b_beneficio: number;
  dim_b_alcance: number;
  dim_c_urgencia: number;
  dim_c_viabilidad: number;
  puntaje_total: number;
  prioridad_calculada?: Prioridad;
}

export interface EvaluacionComite {
  id: number;
  iniciativa_id: number;
  evaluador_id: number;
  dim1_claridad_problema: number;
  dim1_beneficios_cuantificados: number;
  dim1_alineacion_estrategica: number;
  dim1_subtotal: number;
  dim2_arquitectura: number;
  dim2_integracion: number;
  dim2_seguridad: number;
  dim2_escalabilidad: number;
  dim2_subtotal: number;
  dim3_presupuesto_detallado: number;
  dim3_roi_tco: number;
  dim3_riesgos_financieros: number;
  dim3_subtotal: number;
  puntaje_total: number;
  aprobado: boolean;
  veto: boolean;
  motivo_veto?: string;
  observaciones?: string;
  recomendaciones?: string;
  fecha_evaluacion: string;
  evaluador_nombre?: string;
}

export interface Proyecto {
  id: number;
  iniciativa_id: number;
  codigo_proyecto: string;
  nombre: string;
  descripcion?: string;
  estado: EstadoProyecto;
  año_plan?: number;
  semaforo_salud: SemaforoSalud;
  presupuesto_asignado: number;
  fecha_activacion?: string;
  fecha_inicio_planificada?: string;
  fecha_fin_planificada?: string;
  fecha_inicio_real?: string;
  fecha_fin_real?: string;
  fecha_cierre?: string;
  avance_porcentaje: number;
  responsable_id?: number;
  created_at: string;
  updated_at: string;
  iniciativa_titulo?: string;
  responsable_nombre?: string;
  area_demandante_nombre?: string;
  fases?: FaseProyecto[];
  riesgos_abiertos?: number;
  issues_abiertos?: number;
}

export interface FaseProyecto {
  id: number;
  proyecto_id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  fecha_inicio_planificada?: string;
  fecha_fin_planificada?: string;
  fecha_inicio_real?: string;
  fecha_fin_real?: string;
  avance_porcentaje: number;
  estado: string;
  responsable_id?: number;
}

export interface RiesgoProyecto {
  id: number;
  proyecto_id: number;
  descripcion: string;
  probabilidad: string;
  impacto: string;
  mitigacion?: string;
  estado: string;
  fecha_identificacion: string;
}

export interface IssueProyecto {
  id: number;
  proyecto_id: number;
  titulo: string;
  descripcion: string;
  severidad: string;
  estado: string;
  resolucion?: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
}

export interface BitacoraProyecto {
  id: number;
  proyecto_id: number;
  usuario_id: number;
  tipo: string;
  descripcion: string;
  fecha: string;
  usuario_nombre?: string;
}

export interface PresupuestoProyecto {
  id: number;
  proyecto_id: number;
  capex_aprobado: number;
  capex_comprometido: number;
  capex_ejecutado: number;
  opex_proyectado_anual: number;
  opex_tipo: string;
}

export interface DashboardKPIs {
  total_proyectos: number;
  proyectos_por_estado: Record<string, number>;
  presupuesto: {
    capex_aprobado: number;
    capex_comprometido: number;
    capex_ejecutado: number;
    opex_proyectado: number;
  };
  semaforo: {
    verde: number;
    amarillo: number;
    rojo: number;
  };
}

export interface CurvaSDatos {
  periodo: string;
  planificado_mensual: number;
  ejecutado_mensual: number;
  planificado_acumulado: number;
  ejecutado_acumulado: number;
  avance_planificado: number;
  avance_real: number;
}

// Historial y Pipeline
export interface HistorialEstado {
  id: number;
  iniciativa_id: number;
  estado_anterior: EstadoIniciativa | null;
  estado_nuevo: EstadoIniciativa;
  comentario?: string;
  usuario_id: number;
  fecha: string;
  usuario_nombre?: string;
}

export interface IniciativaPipeline {
  id: number;
  codigo: string;
  titulo: string;
  estado: EstadoIniciativa;
  prioridad?: Prioridad;
  monto_estimado: number;
  area_demandante_nombre?: string;
  creador_nombre?: string;
  fecha_solicitud: string;
  dias_en_estado: number;
  urgencia: string;
}

export interface PipelineStats {
  estado: string;
  cantidad: number;
  monto_total: number;
  porcentaje: number;
}

export interface WorkflowMetrics {
  total_iniciativas: number;
  por_estado: PipelineStats[];
  tiempo_promedio_aprobacion?: number;
  tasa_aprobacion: number;
  tasa_rechazo: number;
}
