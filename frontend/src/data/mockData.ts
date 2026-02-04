// Mock data for SGI Dashboard Demo

export interface DashboardStat {
  id: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';
  value: string | number;
  label: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
}

export interface Project {
  id: string;
  title: string;
  priority: 1 | 2 | 3 | 4 | 5;
  type: string;
  amount: string;
  phase: string;
  status: 'en-ejecucion' | 'en-revision' | 'en-riesgo' | 'pendiente' | 'evaluacion' | 'factibilidad' | 'activacion';
  statusLabel: string;
  waitingFor?: string;
  waitingDays?: number;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  action: string;
  route?: string;
}

export interface UpcomingSession {
  id: string;
  date: string;
  time: string;
  type: string;
  projectCount: number;
}

export interface SidebarBadge {
  itemId: string;
  count?: number;
  isNew?: boolean;
}

// Dashboard KPI Stats
export const dashboardStats: DashboardStat[] = [
  {
    id: 'active-projects',
    icon: 'fa-folder-open',
    color: 'blue',
    value: 34,
    label: 'Proyectos Activos',
    trend: {
      value: '12%',
      direction: 'up',
      label: 'vs. mes anterior'
    }
  },
  {
    id: 'closed-year',
    icon: 'fa-check-circle',
    color: 'green',
    value: 127,
    label: 'Cerrados este año',
    trend: {
      value: '8%',
      direction: 'up',
      label: 'vs. año anterior'
    }
  },
  {
    id: 'reserve-bank',
    icon: 'fa-university',
    color: 'yellow',
    value: 45,
    label: 'En Banco de Reserva',
    trend: {
      value: '5%',
      direction: 'down',
      label: 'vs. mes anterior'
    }
  },
  {
    id: 'at-risk',
    icon: 'fa-exclamation-triangle',
    color: 'red',
    value: 6,
    label: 'En Riesgo',
    trend: {
      value: '2',
      direction: 'up',
      label: 'nuevos esta semana'
    }
  },
  {
    id: 'active-budget',
    icon: 'fa-dollar-sign',
    color: 'purple',
    value: '$2.4M',
    label: 'Presupuesto Activo',
    trend: {
      value: '78%',
      direction: 'neutral',
      label: 'ejecutado'
    }
  },
  {
    id: 'plan-compliance',
    icon: 'fa-calendar-check',
    color: 'cyan',
    value: '89%',
    label: 'Cumplimiento Plan',
    trend: {
      value: '3%',
      direction: 'up',
      label: 'vs. mes anterior'
    }
  }
];

// Projects in Execution
export const projectsInExecution: Project[] = [
  {
    id: 'proj-1',
    title: 'Modernización ERP SAP S/4HANA',
    priority: 1,
    type: 'CAPEX Intangible',
    amount: '$850K',
    phase: 'Construcción',
    status: 'en-ejecucion',
    statusLabel: 'En Ejecución'
  },
  {
    id: 'proj-2',
    title: 'Automatización Procesos Comerciales',
    priority: 2,
    type: 'CAPEX Intangible',
    amount: '$320K',
    phase: 'Análisis',
    status: 'en-revision',
    statusLabel: 'En Revisión'
  },
  {
    id: 'proj-3',
    title: 'Ciberseguridad - Zero Trust',
    priority: 1,
    type: 'CAPEX Tangible',
    amount: '$450K',
    phase: 'Pruebas',
    status: 'en-riesgo',
    statusLabel: 'En Riesgo'
  },
  {
    id: 'proj-4',
    title: 'Portal de Autoatención Clientes',
    priority: 3,
    type: 'OPEX',
    amount: '$180K',
    phase: 'Transición',
    status: 'en-ejecucion',
    statusLabel: 'En Ejecución'
  }
];

// Pending Approvals
export const pendingApprovals: Project[] = [
  {
    id: 'pend-1',
    title: 'Migración Data Center',
    priority: 2,
    type: '',
    amount: '',
    phase: '',
    status: 'evaluacion',
    statusLabel: 'Evaluación',
    waitingFor: 'Comité de Expertos',
    waitingDays: 3
  },
  {
    id: 'pend-2',
    title: 'App Móvil Técnicos Terreno',
    priority: 3,
    type: '',
    amount: '',
    phase: '',
    status: 'factibilidad',
    statusLabel: 'Factibilidad',
    waitingFor: 'Informe Factibilidad',
    waitingDays: 5
  },
  {
    id: 'pend-3',
    title: 'Integración SCADA-ERP',
    priority: 1,
    type: '',
    amount: '',
    phase: '',
    status: 'activacion',
    statusLabel: 'Activación',
    waitingFor: 'Activación Plan Anual',
    waitingDays: 1
  }
];

// Quick Actions
export const quickActions: QuickAction[] = [
  {
    id: 'action-1',
    icon: 'fa-plus-circle',
    label: 'Nueva Iniciativa',
    action: 'new-initiative',
    route: '/iniciativas/nueva'
  },
  {
    id: 'action-2',
    icon: 'fa-file-signature',
    label: 'Informe Factibilidad',
    action: 'feasibility-report',
    route: '/iniciativas'
  },
  {
    id: 'action-3',
    icon: 'fa-users',
    label: 'Comité Expertos',
    action: 'experts-committee',
    route: '/iniciativas'
  },
  {
    id: 'action-4',
    icon: 'fa-calendar-plus',
    label: 'Agendar Sesión',
    action: 'schedule-session',
    route: '/proyectos'
  },
  {
    id: 'action-5',
    icon: 'fa-chart-bar',
    label: 'Ver Reportes',
    action: 'view-reports',
    route: '/dashboards/reportes'
  },
  {
    id: 'action-6',
    icon: 'fa-bell',
    label: 'Alertas',
    action: 'alerts',
    route: '/iniciativas'
  }
];

// Upcoming Sessions
export const upcomingSessions: UpcomingSession[] = [
  {
    id: 'session-1',
    date: '05 Feb 2026',
    time: '10:00 AM',
    type: 'Comité Expertos',
    projectCount: 4
  },
  {
    id: 'session-2',
    date: '12 Feb 2026',
    time: '15:00 PM',
    type: 'Comité Inversiones',
    projectCount: 6
  },
  {
    id: 'session-3',
    date: '19 Feb 2026',
    time: '09:00 AM',
    type: 'Review Gobernanza',
    projectCount: 8
  }
];

// Project Phases
export const projectPhases = [
  { id: 'planning', label: 'Planificación', status: 'completed' },
  { id: 'analysis', label: 'Análisis', status: 'completed' },
  { id: 'construction', label: 'Construcción', status: 'in-progress' },
  { id: 'testing', label: 'Pruebas', status: 'pending' },
  { id: 'transition', label: 'Transición', status: 'pending' },
  { id: 'golive', label: 'Go Live', status: 'pending' }
];

// Sidebar Badge Counts
export const sidebarBadgeCounts: Record<string, number | 'new'> = {
  // Activación y Aprobación
  'ingreso-requerimientos': 'new',
  'informes-factibilidad': 12,
  'comite-expertos': 8,
  'banco-reserva': 45,
  'activacion-individual': 3,
  // Implementación
  'kick-off': 5,
  'analisis-diseno': 8,
  'construccion': 12,
  'pruebas': 4,
  'transicion': 2,
  'go-live': 3,
  // Historia
  'proceso-cierre': 4,
  'proyectos-cerrados': 127,
  'rechazados': 18,
  'suspendidos': 6,
  'eliminados-banco': 23
};

// User data
export const currentUser = {
  id: 'user-1',
  nombre: 'Luis',
  apellido: 'Tolorzar',
  email: 'ltolorzar@cge.cl',
  rol: 'administrador',
  avatar: 'LT',
  rolLabel: 'PMO Manager'
};

// Notification count
export const notificationCount = 5;
