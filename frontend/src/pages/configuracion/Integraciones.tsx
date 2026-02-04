import { useState } from 'react';
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
  Activity,
  List,
  FileText,
  Link,
  Unlink,
  Bell,
} from 'lucide-react';

interface Integracion {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'erp' | 'colaboracion' | 'autenticacion' | 'almacenamiento' | 'notificacion';
  estado: 'conectado' | 'desconectado' | 'error';
  ultimaSincronizacion: string;
  frecuencia: string;
  metricas: {
    label: string;
    value: string;
  }[];
  logo: string;
}

const integracionesMock: Integracion[] = [
  {
    id: 1,
    nombre: 'Microsoft SharePoint',
    descripcion: 'Sincronización de documentos del proyecto con SharePoint Online',
    tipo: 'almacenamiento',
    estado: 'conectado',
    ultimaSincronizacion: '2026-02-04T14:30:00',
    frecuencia: '15 min',
    metricas: [
      { label: 'Documentos', value: '342' },
      { label: 'Sync', value: '15 min' },
      { label: 'Última', value: '2h ago' },
    ],
    logo: 'SP',
  },
  {
    id: 2,
    nombre: 'SAP S/4HANA',
    descripcion: 'Integración con módulos FI/CO para presupuesto y gastos',
    tipo: 'erp',
    estado: 'conectado',
    ultimaSincronizacion: '2026-02-04T15:00:00',
    frecuencia: '1h',
    metricas: [
      { label: 'Presupuesto', value: '$12.5M' },
      { label: 'Sync', value: '1h' },
      { label: 'Última', value: '1h ago' },
    ],
    logo: 'SAP',
  },
  {
    id: 3,
    nombre: 'Azure Active Directory',
    descripcion: 'Single Sign-On y gestión de identidades',
    tipo: 'autenticacion',
    estado: 'conectado',
    ultimaSincronizacion: '2026-02-04T15:10:00',
    frecuencia: 'Real-time',
    metricas: [
      { label: 'Usuarios', value: '245' },
      { label: 'Sync', value: 'Real-time' },
      { label: 'Estado', value: 'Active' },
    ],
    logo: 'AAD',
  },
  {
    id: 4,
    nombre: 'Microsoft Outlook / Exchange',
    descripcion: 'Notificaciones por email y sincronización de calendario',
    tipo: 'notificacion',
    estado: 'error',
    ultimaSincronizacion: '2026-02-04T10:00:00',
    frecuencia: 'Instant',
    metricas: [
      { label: 'Emails', value: '892' },
      { label: 'Sync', value: 'Instant' },
      { label: 'Estado', value: 'Rate limit' },
    ],
    logo: 'OUT',
  },
  {
    id: 5,
    nombre: 'Microsoft Teams',
    descripcion: 'Notificaciones en canales de proyecto',
    tipo: 'colaboracion',
    estado: 'conectado',
    ultimaSincronizacion: '2026-02-04T15:05:00',
    frecuencia: 'Instant',
    metricas: [
      { label: 'Canales', value: '12' },
      { label: 'Sync', value: 'Instant' },
      { label: 'Estado', value: 'Active' },
    ],
    logo: 'TMS',
  },
];

const disponiblesMock = [
  { id: 101, nombre: 'Jira', descripcion: 'Gestión de tareas y sprints', tipo: 'colaboracion', logo: 'JIR' },
  { id: 102, nombre: 'Slack', descripcion: 'Comunicación y notificaciones', tipo: 'colaboracion', logo: 'SLK' },
  { id: 103, nombre: 'Power BI', descripcion: 'Dashboards y reportes avanzados', tipo: 'erp', logo: 'PBI' },
  { id: 104, nombre: 'Google Workspace', descripcion: 'Documentos y colaboración', tipo: 'almacenamiento', logo: 'GWS' },
  { id: 105, nombre: 'Salesforce', descripcion: 'CRM y gestión comercial', tipo: 'erp', logo: 'SF' },
  { id: 106, nombre: 'ServiceNow', descripcion: 'ITSM y gestión de servicios', tipo: 'erp', logo: 'SNW' },
];

const logsMock = [
  { id: 1, timestamp: '2026-02-04 15:10:23', integracion: 'Microsoft Teams', evento: 'Notificación enviada', estado: 'success', detalles: 'Canal: Proyecto-ERP-2026' },
  { id: 2, timestamp: '2026-02-04 15:05:12', integracion: 'Azure AD', evento: 'Usuario sincronizado', estado: 'success', detalles: 'jperez@cge.cl' },
  { id: 3, timestamp: '2026-02-04 14:30:45', integracion: 'SharePoint', evento: 'Documento actualizado', estado: 'success', detalles: 'Project_Charter_v2.docx' },
  { id: 4, timestamp: '2026-02-04 10:00:00', integracion: 'Microsoft Outlook', evento: 'Error de conexión', estado: 'error', detalles: 'Rate limit exceeded - 429' },
  { id: 5, timestamp: '2026-02-04 09:45:30', integracion: 'SAP S/4HANA', evento: 'Presupuesto sincronizado', estado: 'success', detalles: '45 registros actualizados' },
  { id: 6, timestamp: '2026-02-04 09:00:15', integracion: 'Microsoft Teams', evento: 'Canal creado', estado: 'success', detalles: 'Proyecto-CyberSec-2026' },
  { id: 7, timestamp: '2026-02-03 18:30:00', integracion: 'SharePoint', evento: 'Backup completado', estado: 'success', detalles: '1.2 GB sincronizados' },
];

const tipoColors: Record<string, string> = {
  erp: 'bg-blue-100 text-blue-700',
  colaboracion: 'bg-green-100 text-green-700',
  autenticacion: 'bg-purple-100 text-purple-700',
  almacenamiento: 'bg-amber-100 text-amber-700',
  notificacion: 'bg-cyan-100 text-cyan-700',
};

const tipoLabels: Record<string, string> = {
  erp: 'ERP/BI',
  colaboracion: 'Colaboración',
  autenticacion: 'Autenticación',
  almacenamiento: 'Almacenamiento',
  notificacion: 'Notificación',
};

const estadoConfig: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
  conectado: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Conectado' },
  desconectado: { color: 'text-gray-500', bgColor: 'bg-gray-100', icon: XCircle, label: 'Desconectado' },
  error: { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle, label: 'Error' },
};

export default function Integraciones() {
  const [activeTab, setActiveTab] = useState<'activas' | 'disponibles' | 'logs'>('activas');
  const [selectedIntegracion, setSelectedIntegracion] = useState<Integracion | null>(null);

  const stats = {
    activas: integracionesMock.filter((i) => i.estado === 'conectado').length,
    sincronizaciones: 1245,
    alertas: integracionesMock.filter((i) => i.estado === 'error').length,
    uptime: 99.8,
  };

  const tabs = [
    { id: 'activas', label: 'Integraciones Activas', icon: Link, count: integracionesMock.length },
    { id: 'disponibles', label: 'Disponibles', icon: Puzzle, count: disponiblesMock.length },
    { id: 'logs', label: 'Logs', icon: FileText },
  ];

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
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activas}</p>
              <p className="text-sm text-gray-500">Integraciones Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.sincronizaciones.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Sincronizaciones (día)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.alertas}</p>
              <p className="text-sm text-gray-500">Alertas Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Activity className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.uptime}%</p>
              <p className="text-sm text-gray-500">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {stats.alertas > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {stats.alertas} integración{stats.alertas > 1 ? 'es' : ''} con errores
            </p>
            <p className="text-xs text-red-600 mt-0.5">Revise la configuración y credenciales de las integraciones afectadas</p>
          </div>
          <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
            Ver Alertas
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* INTEGRACIONES ACTIVAS */}
          {activeTab === 'activas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integracionesMock.map((integracion) => {
                const estadoInfo = estadoConfig[integracion.estado];
                const EstadoIcon = estadoInfo.icon;

                return (
                  <div
                    key={integracion.id}
                    className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer ${
                      integracion.estado === 'error' ? 'border-red-200' : 'border-gray-200 hover:border-accent/50'
                    }`}
                    onClick={() => setSelectedIntegracion(integracion)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">{integracion.logo}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{integracion.nombre}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${estadoInfo.bgColor} ${estadoInfo.color}`}>
                            <EstadoIcon className="h-3 w-3" />
                            {estadoInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">{integracion.descripcion}</p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      {integracion.metricas.slice(0, 3).map((metrica, index) => (
                        <div key={index} className="text-center">
                          <p className="text-sm font-semibold text-gray-900">{metrica.value}</p>
                          <p className="text-[10px] text-gray-500">{metrica.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <Settings className="h-3.5 w-3.5" />
                        Configurar
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sincronizar
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <Unlink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DISPONIBLES */}
          {activeTab === 'disponibles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {disponiblesMock.map((integracion) => (
                <div
                  key={integracion.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-accent/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">{integracion.logo}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{integracion.nombre}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tipoColors[integracion.tipo]}`}>
                        {tipoLabels[integracion.tipo]}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">{integracion.descripcion}</p>

                  <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                    <Link className="h-4 w-4" />
                    Conectar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* LOGS */}
          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Integración</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logsMock.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 font-mono">{log.timestamp}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{log.integracion}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{log.evento}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          log.estado === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.estado === 'success' ? (
                            <><CheckCircle className="h-3 w-3" /> OK</>
                          ) : (
                            <><AlertTriangle className="h-3 w-3" /> Error</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">{log.detalles}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
