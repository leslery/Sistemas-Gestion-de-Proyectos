import { useState } from 'react';
import {
  GitBranch,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  List,
  Workflow,
  History,
  Play,
  Pause,
  Settings,
  Users,
  ChevronRight,
} from 'lucide-react';

interface FlujoTrabajo {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: 'activo' | 'borrador' | 'inactivo';
  etapas: { nombre: string; aprobadores: string[] }[];
  sla: number;
  instanciasActivas: number;
  ultimaModificacion: string;
}

const flujosMock: FlujoTrabajo[] = [
  {
    id: 1,
    nombre: 'Aprobación de Requerimiento',
    descripcion: 'Flujo para nuevas iniciativas/requerimientos',
    tipo: 'Requerimiento',
    estado: 'activo',
    etapas: [
      { nombre: 'Unit Area', aprobadores: ['Jefe de Área'] },
      { nombre: 'Sponsor', aprobadores: ['Sponsor del Proyecto'] },
      { nombre: 'PMO', aprobadores: ['PMO Manager'] },
    ],
    sla: 5,
    instanciasActivas: 5,
    ultimaModificacion: '2026-01-15',
  },
  {
    id: 2,
    nombre: 'Aprobación de Factibilidad',
    descripcion: 'Evaluación de informes de factibilidad',
    tipo: 'Factibilidad',
    estado: 'activo',
    etapas: [
      { nombre: 'Analista', aprobadores: ['Analista TD'] },
      { nombre: 'Comité Evaluación', aprobadores: ['Comité de Expertos'] },
      { nombre: 'Sponsor', aprobadores: ['Sponsor del Proyecto'] },
    ],
    sla: 12,
    instanciasActivas: 12,
    ultimaModificacion: '2026-01-20',
  },
  {
    id: 3,
    nombre: 'Activación de Proyecto',
    descripcion: 'Activación de proyectos aprobados',
    tipo: 'Activación',
    estado: 'activo',
    etapas: [
      { nombre: 'PMO', aprobadores: ['PMO Manager'] },
      { nombre: 'Sponsor', aprobadores: ['Sponsor del Proyecto'] },
      { nombre: 'Directorio', aprobadores: ['Comité de Inversiones'] },
    ],
    sla: 15,
    instanciasActivas: 15,
    ultimaModificacion: '2026-01-25',
  },
  {
    id: 4,
    nombre: 'Aprobación Compra Sin Contrato',
    descripcion: 'Solicitudes de compra sin contrato marco',
    tipo: 'Compras',
    estado: 'activo',
    etapas: [
      { nombre: 'PM', aprobadores: ['Project Manager'] },
      { nombre: 'Compras', aprobadores: ['Jefe de Compras'] },
      { nombre: 'Finanzas', aprobadores: ['Gerente de Finanzas'] },
    ],
    sla: 7,
    instanciasActivas: 7,
    ultimaModificacion: '2026-01-28',
  },
  {
    id: 5,
    nombre: 'Cambio de Alcance',
    descripcion: 'Solicitudes de cambio de alcance del proyecto',
    tipo: 'Cambios',
    estado: 'activo',
    etapas: [
      { nombre: 'PM', aprobadores: ['Project Manager'] },
      { nombre: 'CAM', aprobadores: ['Change Advisory Manager'] },
      { nombre: 'Sponsor', aprobadores: ['Sponsor del Proyecto'] },
    ],
    sla: 5,
    instanciasActivas: 5,
    ultimaModificacion: '2026-02-01',
  },
];

const historialMock = [
  { id: 1, flujo: 'Aprobación de Requerimiento', accion: 'Aprobación completada', usuario: 'Luis Tolorzar', fecha: '2026-02-04 10:30', instancia: 'REQ-2026-045' },
  { id: 2, flujo: 'Activación de Proyecto', accion: 'Escalado a Directorio', usuario: 'María López', fecha: '2026-02-04 09:15', instancia: 'ACT-2026-012' },
  { id: 3, flujo: 'Cambio de Alcance', accion: 'Rechazado por CAM', usuario: 'Carlos Méndez', fecha: '2026-02-03 16:45', instancia: 'CHG-2026-008' },
  { id: 4, flujo: 'Aprobación de Factibilidad', accion: 'Enviado a Comité', usuario: 'Ana García', fecha: '2026-02-03 14:20', instancia: 'FACT-2026-023' },
  { id: 5, flujo: 'Aprobación Compra Sin Contrato', accion: 'Aprobación completada', usuario: 'Pedro Rojas', fecha: '2026-02-03 11:00', instancia: 'COMP-2026-067' },
];

const tipoColors: Record<string, string> = {
  'Requerimiento': 'bg-blue-100 text-blue-700',
  'Factibilidad': 'bg-purple-100 text-purple-700',
  'Activación': 'bg-green-100 text-green-700',
  'Compras': 'bg-amber-100 text-amber-700',
  'Cambios': 'bg-cyan-100 text-cyan-700',
};

const estadoColors: Record<string, string> = {
  activo: 'bg-green-100 text-green-700',
  borrador: 'bg-gray-100 text-gray-700',
  inactivo: 'bg-red-100 text-red-700',
};

export default function FlujosTrabajo() {
  const [activeTab, setActiveTab] = useState<'lista' | 'editor' | 'historial'>('lista');
  const [selectedFlujo, setSelectedFlujo] = useState<FlujoTrabajo | null>(null);

  const stats = {
    flujosActivos: flujosMock.filter((f) => f.estado === 'activo').length,
    aprobacionesMes: 156,
    tiempoPromedio: 2.3,
    pendientesRevision: 12,
  };

  const tabs = [
    { id: 'lista', label: 'Lista de Flujos', icon: List },
    { id: 'editor', label: 'Editor Visual', icon: Workflow },
    { id: 'historial', label: 'Historial', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="h-7 w-7 text-accent" />
            Flujos de Trabajo
          </h1>
          <p className="text-gray-500 mt-1">Configuración de workflows de aprobación</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo Flujo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GitBranch className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.flujosActivos}</p>
              <p className="text-sm text-gray-500">Flujos Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.aprobacionesMes}</p>
              <p className="text-sm text-gray-500">Aprobaciones (mes)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Clock className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.tiempoPromedio} días</p>
              <p className="text-sm text-gray-500">Tiempo Prom. Aprobación</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendientesRevision}</p>
              <p className="text-sm text-gray-500">Pendientes de Revisión</p>
            </div>
          </div>
        </div>
      </div>

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
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* LISTA DE FLUJOS */}
          {activeTab === 'lista' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Flujo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etapas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aprobadores</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA (días)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {flujosMock.map((flujo) => (
                    <tr key={flujo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{flujo.nombre}</p>
                          <p className="text-xs text-gray-500">{flujo.descripcion}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoColors[flujo.tipo]}`}>
                          {flujo.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {flujo.etapas.map((etapa, index) => (
                            <div key={index} className="flex items-center">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {etapa.nombre}
                              </span>
                              {index < flujo.etapas.length - 1 && (
                                <ChevronRight className="h-3 w-3 text-gray-400 mx-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{flujo.etapas.length} niveles</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-900">{flujo.sla}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[flujo.estado]}`}>
                          {flujo.estado.charAt(0).toUpperCase() + flujo.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedFlujo(flujo)}
                            className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                            title="Ver"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* EDITOR VISUAL */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* Workflow Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Seleccionar Flujo:</label>
                <select
                  value={selectedFlujo?.id || ''}
                  onChange={(e) => setSelectedFlujo(flujosMock.find(f => f.id === parseInt(e.target.value)) || null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                >
                  <option value="">-- Seleccione un flujo --</option>
                  {flujosMock.map((flujo) => (
                    <option key={flujo.id} value={flujo.id}>{flujo.nombre}</option>
                  ))}
                </select>
              </div>

              {selectedFlujo ? (
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedFlujo.nombre}</h3>
                    <p className="text-sm text-gray-500">{selectedFlujo.descripcion}</p>
                  </div>

                  {/* Visual Flow */}
                  <div className="flex items-center justify-center gap-4 py-8">
                    {/* Start Node */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs text-gray-500 mt-2">Inicio</span>
                    </div>

                    <ArrowRight className="h-6 w-6 text-gray-400" />

                    {/* Stages */}
                    {selectedFlujo.etapas.map((etapa, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-32 bg-white rounded-xl border-2 border-accent p-4 shadow-sm">
                            <div className="flex items-center justify-center mb-2">
                              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-accent">{index + 1}</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-900 text-center">{etapa.nombre}</p>
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
                                <span>{etapa.aprobadores.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < selectedFlujo.etapas.length - 1 && (
                          <ArrowRight className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    ))}

                    <ArrowRight className="h-6 w-6 text-gray-400" />

                    {/* End Node */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs text-gray-500 mt-2">Fin</span>
                    </div>
                  </div>

                  {/* Stage Details */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedFlujo.etapas.map((etapa, index) => (
                      <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">Etapa {index + 1}: {etapa.nombre}</h4>
                          <button className="p-1 text-gray-400 hover:text-accent">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 font-medium">Aprobadores:</p>
                          {etapa.aprobadores.map((aprobador, aIndex) => (
                            <div key={aIndex} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-3 w-3 text-gray-500" />
                              </div>
                              {aprobador}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Workflow className="h-16 w-16 mb-4" />
                  <p className="text-lg font-medium">Seleccione un flujo para visualizar</p>
                  <p className="text-sm">O cree uno nuevo con el botón superior</p>
                </div>
              )}
            </div>
          )}

          {/* HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flujo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instancia</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historialMock.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{item.fecha}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{item.flujo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-accent font-mono">{item.instancia}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.accion.includes('completada') ? 'bg-green-100 text-green-700' :
                          item.accion.includes('Rechazado') ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.accion}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{item.usuario}</span>
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
