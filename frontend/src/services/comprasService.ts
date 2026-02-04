import api from './api';

export interface SolicitudCompra {
  id: number;
  codigo: string;
  descripcion: string;
  proyecto: string;
  solicitante: string;
  fechaSolicitud: string;
  montoEstimado: number;
  estado: 'pendiente' | 'en_evaluacion' | 'aprobada' | 'rechazada';
  prioridad: 'alta' | 'media' | 'baja';
  tipoCompra: 'servicio' | 'licencia' | 'hardware' | 'consultoria';
}

export interface Proveedor {
  id: number;
  rut: string;
  nombre: string;
  giro: string;
  contacto: string;
  email: string;
  telefono: string;
  calificacion: number;
  contratosActivos: number;
  montoContratado: number;
  estado: 'activo' | 'inactivo' | 'bloqueado';
}

export interface Contrato {
  id: number;
  codigo: string;
  proveedor: string;
  proyecto: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  montoTotal: number;
  montoEjecutado: number;
  estado: 'vigente' | 'por_vencer' | 'vencido' | 'cerrado';
  tipoContrato: 'marco' | 'especifico' | 'adendum';
}

export interface OrdenCompra {
  id: number;
  numero: string;
  contrato: string;
  proveedor: string;
  proyecto: string;
  descripcion: string;
  fechaEmision: string;
  fechaEntrega: string;
  monto: number;
  estado: 'emitida' | 'en_transito' | 'recibida' | 'facturada' | 'pagada';
}

export const comprasService = {
  // Solicitudes sin contrato
  getSolicitudes: async (): Promise<SolicitudCompra[]> => {
    const response = await api.get('/compras/solicitudes');
    return response.data;
  },

  createSolicitud: async (solicitud: Partial<SolicitudCompra>): Promise<SolicitudCompra> => {
    const response = await api.post('/compras/solicitudes', solicitud);
    return response.data;
  },

  updateSolicitud: async (id: number, solicitud: Partial<SolicitudCompra>): Promise<SolicitudCompra> => {
    const response = await api.put(`/compras/solicitudes/${id}`, solicitud);
    return response.data;
  },

  // Proveedores
  getProveedores: async (): Promise<Proveedor[]> => {
    const response = await api.get('/compras/proveedores');
    return response.data;
  },

  getProveedor: async (id: number): Promise<Proveedor> => {
    const response = await api.get(`/compras/proveedores/${id}`);
    return response.data;
  },

  evaluarProveedor: async (id: number, evaluacion: { calificacion: number; comentarios: string }): Promise<void> => {
    await api.post(`/compras/proveedores/${id}/evaluacion`, evaluacion);
  },

  // Contratos
  getContratos: async (): Promise<Contrato[]> => {
    const response = await api.get('/compras/contratos');
    return response.data;
  },

  getContrato: async (id: number): Promise<Contrato> => {
    const response = await api.get(`/compras/contratos/${id}`);
    return response.data;
  },

  createContrato: async (contrato: Partial<Contrato>): Promise<Contrato> => {
    const response = await api.post('/compras/contratos', contrato);
    return response.data;
  },

  // Órdenes de compra
  getOrdenes: async (): Promise<OrdenCompra[]> => {
    const response = await api.get('/compras/ordenes');
    return response.data;
  },

  createOrden: async (orden: Partial<OrdenCompra>): Promise<OrdenCompra> => {
    const response = await api.post('/compras/ordenes', orden);
    return response.data;
  },

  updateOrdenEstado: async (id: number, estado: OrdenCompra['estado']): Promise<OrdenCompra> => {
    const response = await api.patch(`/compras/ordenes/${id}/estado`, { estado });
    return response.data;
  },
};

export default comprasService;
