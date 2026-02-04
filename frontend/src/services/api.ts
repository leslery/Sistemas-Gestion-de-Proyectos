import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/registro', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Usuarios
export const usuariosService = {
  getAll: async (params?: any) => {
    const response = await api.get('/usuarios/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/usuarios/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },
  getAreas: async () => {
    const response = await api.get('/usuarios/areas/');
    return response.data;
  },
  createArea: async (data: { nombre: string; codigo: string; descripcion?: string }) => {
    const response = await api.post('/usuarios/areas/', data);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/cambiar-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Iniciativas
export const iniciativasService = {
  getAll: async (params?: any) => {
    const response = await api.get('/iniciativas/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/iniciativas/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/iniciativas/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/iniciativas/${id}`, data);
    return response.data;
  },
  enviar: async (id: number) => {
    const response = await api.post(`/iniciativas/${id}/enviar`);
    return response.data;
  },
  calcularScoring: async (id: number, data: any) => {
    const response = await api.post(`/iniciativas/${id}/scoring`, data);
    return response.data;
  },
  aprobarRevision: async (id: number) => {
    const response = await api.post(`/iniciativas/${id}/aprobar-revision`);
    return response.data;
  },
  // Pipeline y Workflow
  getPipeline: async (params?: any) => {
    const response = await api.get('/iniciativas/workflow/pipeline', { params });
    return response.data;
  },
  getWorkflowMetrics: async (año?: number) => {
    const response = await api.get('/iniciativas/workflow/metrics', { params: { año } });
    return response.data;
  },
  getHistorial: async (id: number) => {
    const response = await api.get(`/iniciativas/${id}/historial`);
    return response.data;
  },
  cambiarEstado: async (id: number, nuevoEstado: string, comentario?: string) => {
    const response = await api.post(`/iniciativas/${id}/cambiar-estado`, null, {
      params: { nuevo_estado: nuevoEstado, comentario }
    });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/iniciativas/${id}`);
    return response.data;
  },
};

// Evaluaciones
export const evaluacionesService = {
  getPendientes: async () => {
    const response = await api.get('/evaluaciones/pendientes');
    return response.data;
  },
  getByIniciativa: async (iniciativaId: number) => {
    const response = await api.get(`/evaluaciones/iniciativa/${iniciativaId}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/evaluaciones/', data);
    return response.data;
  },
  update: async (evaluacionId: number, data: any) => {
    const response = await api.put(`/evaluaciones/${evaluacionId}`, data);
    return response.data;
  },
  cerrar: async (iniciativaId: number) => {
    const response = await api.post(`/evaluaciones/iniciativa/${iniciativaId}/cerrar-evaluacion`);
    return response.data;
  },
};

// Proyectos
export const proyectosService = {
  getAll: async (params?: any) => {
    const response = await api.get('/proyectos/', { params });
    return response.data;
  },
  getBancoReserva: async () => {
    const response = await api.get('/proyectos/banco-reserva');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/proyectos/${id}`);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/proyectos/${id}`, data);
    return response.data;
  },
  activar: async (id: number) => {
    const response = await api.post(`/proyectos/${id}/activar`);
    return response.data;
  },
  cerrar: async (id: number, data?: any) => {
    const response = await api.post(`/proyectos/${id}/cerrar`, null, { params: data });
    return response.data;
  },
  getFases: async (id: number) => {
    const response = await api.get(`/proyectos/${id}/fases`);
    return response.data;
  },
  crearFase: async (proyectoId: number, data: any) => {
    const response = await api.post(`/proyectos/${proyectoId}/fases`, data);
    return response.data;
  },
  actualizarFase: async (faseId: number, data: any) => {
    const response = await api.put(`/proyectos/fases/${faseId}`, data);
    return response.data;
  },
  completarHito: async (hitoId: number) => {
    const response = await api.put(`/proyectos/hitos/${hitoId}/completar`);
    return response.data;
  },
  crearHito: async (proyectoId: number, data: any) => {
    const response = await api.post(`/proyectos/${proyectoId}/hitos`, data);
    return response.data;
  },
  getRiesgos: async (id: number) => {
    const response = await api.get(`/proyectos/${id}/riesgos`);
    return response.data;
  },
  crearRiesgo: async (proyectoId: number, data: any) => {
    const response = await api.post(`/proyectos/${proyectoId}/riesgos`, data);
    return response.data;
  },
  getIssues: async (id: number) => {
    const response = await api.get(`/proyectos/${id}/issues`);
    return response.data;
  },
  crearIssue: async (proyectoId: number, data: any) => {
    const response = await api.post(`/proyectos/${proyectoId}/issues`, data);
    return response.data;
  },
  getBitacora: async (id: number) => {
    const response = await api.get(`/proyectos/${id}/bitacora`);
    return response.data;
  },
  crearBitacora: async (proyectoId: number, data: any) => {
    const response = await api.post(`/proyectos/${proyectoId}/bitacora`, data);
    return response.data;
  },
};

// Planificación
export const planificacionService = {
  getPlanes: async () => {
    const response = await api.get('/planificacion/planes');
    return response.data;
  },
  getPlan: async (año: number) => {
    const response = await api.get(`/planificacion/planes/${año}`);
    return response.data;
  },
  crearPlan: async (data: any) => {
    const response = await api.post('/planificacion/planes', null, { params: data });
    return response.data;
  },
  actualizarPlan: async (año: number, data: any) => {
    const response = await api.put(`/planificacion/planes/${año}`, data);
    return response.data;
  },
  agregarProyecto: async (año: number, proyectoId: number, monto: number) => {
    const response = await api.post(`/planificacion/planes/${año}/agregar-proyecto`, null, {
      params: { proyecto_id: proyectoId, monto_asignado: monto },
    });
    return response.data;
  },
  quitarProyecto: async (año: number, proyectoId: number) => {
    const response = await api.delete(`/planificacion/planes/${año}/quitar-proyecto/${proyectoId}`);
    return response.data;
  },
  aprobarPlan: async (año: number) => {
    const response = await api.post(`/planificacion/planes/${año}/aprobar`);
    return response.data;
  },
  simular: async (año: number) => {
    const response = await api.get(`/planificacion/simulacion/${año}`);
    return response.data;
  },
};

// Presupuesto
export const presupuestoService = {
  getProyecto: async (proyectoId: number) => {
    const response = await api.get(`/presupuesto/proyecto/${proyectoId}`);
    return response.data;
  },
  crearPresupuesto: async (proyectoId: number, data: any) => {
    const response = await api.post(`/presupuesto/proyecto/${proyectoId}`, data);
    return response.data;
  },
  getCambiosPendientes: async () => {
    const response = await api.get('/presupuesto/cambios/pendientes');
    return response.data;
  },
  solicitarCambio: async (data: any) => {
    const response = await api.post('/presupuesto/cambios', data);
    return response.data;
  },
  aprobarCambio: async (cambioId: number, monto: number, observaciones?: string) => {
    const response = await api.post(`/presupuesto/cambios/${cambioId}/aprobar`, null, {
      params: { monto_aprobado: monto, observaciones },
    });
    return response.data;
  },
  rechazarCambio: async (cambioId: number, observaciones?: string) => {
    const response = await api.post(`/presupuesto/cambios/${cambioId}/rechazar`, null, {
      params: { observaciones },
    });
    return response.data;
  },
  getClasificacion: async (proyectoId: number) => {
    const response = await api.get(`/presupuesto/clasificacion/proyecto/${proyectoId}`);
    return response.data;
  },
  clasificarGasto: async (proyectoId: number, data: any) => {
    const response = await api.post(`/presupuesto/clasificacion/proyecto/${proyectoId}`, data);
    return response.data;
  },
  getCambiosProyecto: async (proyectoId: number) => {
    const response = await api.get(`/presupuesto/cambios/proyecto/${proyectoId}`);
    return response.data;
  },
  getCurvaS: async (proyectoId: number) => {
    const response = await api.get(`/presupuesto/curva-s/proyecto/${proyectoId}`);
    return response.data;
  },
  getAlertas: async (proyectoId: number) => {
    const response = await api.get(`/presupuesto/alertas/proyecto/${proyectoId}`);
    return response.data;
  },
};

// Dashboard
export const dashboardService = {
  getEjecutivo: async (año?: number) => {
    const response = await api.get('/dashboard/ejecutivo', { params: { año } });
    return response.data;
  },
  getKPIs: async (año?: number) => {
    const response = await api.get('/dashboard/kpis', { params: { año } });
    return response.data;
  },
  getFunnel: async () => {
    const response = await api.get('/dashboard/funnel');
    return response.data;
  },
  getSalud: async () => {
    const response = await api.get('/dashboard/salud');
    return response.data;
  },
  getFinanciero: async (año?: number) => {
    const response = await api.get('/dashboard/financiero', { params: { año } });
    return response.data;
  },
  getPorRol: async () => {
    const response = await api.get('/dashboard/por-rol');
    return response.data;
  },
  getBancoReserva: async () => {
    const response = await api.get('/dashboard/banco-reserva');
    return response.data;
  },
  getClasificacion: async () => {
    const response = await api.get('/dashboard/clasificacion');
    return response.data;
  },
};

// Seguimiento
export const seguimientoService = {
  registrarEjecucion: async (data: any) => {
    const response = await api.post('/seguimiento/ejecucion', data);
    return response.data;
  },
  getEjecucionProyecto: async (proyectoId: number, año?: number) => {
    const response = await api.get(`/seguimiento/ejecucion/proyecto/${proyectoId}`, {
      params: { año },
    });
    return response.data;
  },
  actualizarAvance: async (proyectoId: number, avance: number, comentario?: string) => {
    const response = await api.put(`/seguimiento/proyecto/${proyectoId}/avance`, null, {
      params: { avance_porcentaje: avance, comentario },
    });
    return response.data;
  },
  getResumenPortfolio: async (año?: number) => {
    const response = await api.get('/seguimiento/resumen-portfolio', { params: { año } });
    return response.data;
  },
  actualizarSemaforo: async (proyectoId: number, semaforo: string, comentario?: string) => {
    const response = await api.put(`/seguimiento/proyecto/${proyectoId}/semaforo`, null, {
      params: { semaforo_salud: semaforo, comentario },
    });
    return response.data;
  },
};

export default api;
