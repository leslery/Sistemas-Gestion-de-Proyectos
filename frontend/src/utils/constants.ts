export const ESTADOS_INICIATIVA = {
  borrador: { label: 'Borrador', color: 'gray' },
  enviada: { label: 'Enviada', color: 'blue' },
  en_revision: { label: 'En Revisión', color: 'yellow' },
  en_evaluacion: { label: 'En Evaluación', color: 'purple' },
  aprobada: { label: 'Aprobada', color: 'green' },
  rechazada: { label: 'Rechazada', color: 'red' },
  en_banco_reserva: { label: 'Banco Reserva', color: 'blue' },
  en_plan_anual: { label: 'Plan Anual', color: 'purple' },
  activada: { label: 'Activada', color: 'green' },
};

export const ESTADOS_PROYECTO = {
  banco_reserva: { label: 'Banco Reserva', color: 'blue' },
  plan_anual: { label: 'Plan Anual', color: 'purple' },
  en_ejecucion: { label: 'En Ejecución', color: 'green' },
  pausado: { label: 'Pausado', color: 'yellow' },
  cancelado: { label: 'Cancelado', color: 'red' },
  completado: { label: 'Completado', color: 'gray' },
};

export const PRIORIDADES = {
  P1: { label: 'P1 - Muy Alta', color: 'red' },
  P2: { label: 'P2 - Alta', color: 'orange' },
  P3: { label: 'P3 - Media', color: 'yellow' },
  P4: { label: 'P4 - Baja', color: 'blue' },
  P5: { label: 'P5 - Muy Baja', color: 'gray' },
};

export const SEMAFOROS = {
  verde: { label: 'En Control', color: 'green' },
  amarillo: { label: 'En Riesgo', color: 'yellow' },
  rojo: { label: 'Crítico', color: 'red' },
};

export const ROLES = {
  demandante: 'Demandante',
  analista_td: 'Analista TD',
  jefe_td: 'Jefe TD',
  comite_expertos: 'Comité de Expertos',
  cgedx: 'CGEDx',
  administrador: 'Administrador',
};

export const CLASIFICACIONES_INVERSION = {
  estandar_a: 'Estándar A',
  estandar_b: 'Estándar B',
  alta_a: 'Alta A',
  alta_b: 'Alta B',
  alta_c: 'Alta C',
  estrategica: 'Estratégica',
};

export const TIPOS_INFORME = {
  V1: 'V1 - Estándar',
  V2: 'V2 - Alta Inversión',
  V3: 'V3 - Estratégica',
};

export const URGENCIAS = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  critica: 'Crítica',
};
