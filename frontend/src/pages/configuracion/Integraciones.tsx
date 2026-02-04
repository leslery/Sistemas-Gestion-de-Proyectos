import React, { useState } from 'react';
import {
  Puzzle,
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  ExternalLink,
  Clock,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface Integracion {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'erp' | 'bi' | 'comunicacion' | 'almacenamiento' | 'autenticacion';
  estado: 'activo' | 'inactivo' | 'error';
  ultimaSincronizacion: string;
  frecuencia: string;
  registrosSincronizados: number;
  icono: string;
}

const integraciones: Integracion[] = [
  { id: 1, nombre: 'SAP S/4HANA', descripcion: 'Integración con ERP para sincronización de presupuestos y proyectos', tipo: 'erp', estado: 'activo', ultimaSincronizacion: '2024-02-12T14:30:00', frecuencia: 'Cada hora', registrosSincronizados: 1250, icono: 'SAP' },
  { id: 2, nombre: 'Power BI', descripcion: 'Conexión para dashboards y reportes avanzados', tipo: 'bi', estado: 'activo', ultimaSincronizacion: '2024-02-12T15:00:00', frecuencia: 'Cada 15 min', registrosSincronizados: 5400, icono: 'PBI' },
  { id: 3, nombre: 'Microsoft Teams', descripcion: 'Notificaciones y colaboración en tiempo real', tipo: 'comunicacion', estado: 'activo', ultimaSincronizacion: '2024-02-12T15:10:00', frecuencia: 'Tiempo real', registrosSincronizados: 890, icono: 'Teams' },
  { id: 4, nombre: 'SharePoint', descripcion: 'Almacenamiento de documentos y archivos', tipo: 'almacenamiento', estado: 'activo', ultimaSincronizacion: '2024-02-12T14:45:00', frecuencia: 'Cada 30 min', registrosSincronizados: 3200, icono: 'SP' },
  { id: 5, nombre: 'Azure AD', descripcion: 'Autenticación y gestión de usuarios', tipo: 'autenticacion', estado: 'activo', ultimaSincronizacion: '2024-02-12T15:05:00', frecuencia: 'Tiempo real', registrosSincronizados: 450, icono: 'AAD' },
  { id: 6, nombre: 'Jira', descripcion: 'Sincronización de tareas y issues de desarrollo', tipo: 'erp', estado: 'error', ultimaSincronizacion: '2024-02-12T10:00:00', frecuencia: 'Cada hora', registrosSincronizados: 0, icono: 'JIRA' },
];

const tipoColors = {
  erp: 'bg-blue-100 text-blue-700',
  bi: 'bg-purple-100 text-purple-700',
  comunicacion: 'bg-green-100 text-green-700',
  almacenamiento: 'bg-amber-100 text-amber-700',
  autenticacion: 'bg-red-100 text-red-700',
};

const tipoLabels = {
  erp: 'ERP',
  bi: 'BI/Analytics',
  comunicacion: 'Comunicación',
  almacenamiento: 'Almacenamiento',
  autenticacion: 'Autenticación',
};

const estadoConfig = {
  activo: { color: 'text-green-500', icon: CheckCircle, label: 'Activo' },
  inactivo: { color: 'text-gray-400', icon: XCircle, label: 'Inactivo' },
  error: { color: 'text-red-500', icon: AlertTriangle, label: 'Error' },
};

export default function Integraciones() {
  const [selectedIntegracion, setSelectedIntegracion] = useState<Integracion | null>(null);

  const stats = {
    totalIntegraciones: integraciones.length,
    activas: integraciones.filter((i) => i.estado === 'activo').length,
    conError: integraciones.filter((i) => i.estado === 'error').length,
    registrosTotales: integraciones.reduce((acc, i) => acc + i.registrosSincronizados, 0),
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeDiff = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Puzzle className="h-7 w-7 text-accent" />
            Integraciones
          </h1>
          <p className="text-gray-500 mt-1">Conexiones con sistemas externos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nueva Integración
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Integraciones"
          value={stats.totalIntegraciones}
          icon={Puzzle}
          color="primary"
        />
        <KPICard
          title="Activas"
          value={stats.activas}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Con Error"
          value={stats.conError}
          icon={AlertTriangle}
          color="danger"
        />
        <KPICard
          title="Registros Sincronizados"
          value={stats.registrosTotales.toLocaleString()}
          icon={RefreshCw}
          color="default"
        />
      </div>

      {/* Error Alert */}
      {stats.conError > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {stats.conError} integración{stats.conError > 1 ? 'es' : ''} con errores
            </p>
            <p className="text-xs text-red-600 mt-0.5">Revise la configuración y credenciales de las integraciones afectadas</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrations List */}
        <div className="lg:col-span-2 space-y-4">
          {integraciones.map((integracion) => {
            const estadoInfo = estadoConfig[integracion.estado];
            const EstadoIcon = estadoInfo.icon;

            return (
              <div
                key={integracion.id}
                onClick={() => setSelectedIntegracion(integracion)}
                className={`bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-accent/50 transition-colors ${
                  selectedIntegracion?.id === integracion.id ? 'border-accent ring-1 ring-accent/20' : ''
                } ${integracion.estado === 'error' ? 'border-red-200' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">{integracion.icono}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{integracion.nombre}</h3>
                        <EstadoIcon className={`h-4 w-4 ${estadoInfo.color}`} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{integracion.descripcion}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${tipoColors[integracion.tipo]}`}>
                    {tipoLabels[integracion.tipo]}
                  </span>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{integracion.frecuencia}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <RefreshCw className="h-4 w-4" />
                    <span>{getTimeDiff(integracion.ultimaSincronizacion)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Zap className="h-4 w-4" />
                    <span>{integracion.registrosSincronizados.toLocaleString()} registros</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {selectedIntegracion ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600">{selectedIntegracion.icono}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedIntegracion.nombre}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${tipoColors[selectedIntegracion.tipo]}`}>
                    {tipoLabels[selectedIntegracion.tipo]}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${estadoConfig[selectedIntegracion.estado].color}`}>
                    {React.createElement(estadoConfig[selectedIntegracion.estado].icon, { className: 'h-4 w-4' })}
                    {estadoConfig[selectedIntegracion.estado].label}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Última Sincronización</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatTime(selectedIntegracion.ultimaSincronizacion)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Frecuencia</span>
                  <span className="text-sm font-medium text-gray-900">{selectedIntegracion.frecuencia}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Registros</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedIntegracion.registrosSincronizados.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                  <RefreshCw className="h-4 w-4" />
                  Sincronizar Ahora
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Settings className="h-4 w-4" />
                  Configuración
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <ExternalLink className="h-4 w-4" />
                  Ver Logs
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Puzzle className="h-12 w-12 mb-3" />
              <p className="text-sm">Seleccione una integración para ver detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
