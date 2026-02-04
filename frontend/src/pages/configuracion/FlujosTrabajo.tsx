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
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface FlujoTrabajo {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'iniciativa' | 'proyecto' | 'aprobacion' | 'compras';
  estado: 'activo' | 'borrador' | 'inactivo';
  etapas: number;
  instanciasActivas: number;
  ultimaModificacion: string;
}

const flujos: FlujoTrabajo[] = [
  { id: 1, nombre: 'Aprobación de Iniciativas', descripcion: 'Flujo estándar para evaluación y aprobación de nuevas iniciativas', tipo: 'iniciativa', estado: 'activo', etapas: 6, instanciasActivas: 12, ultimaModificacion: '2024-02-01' },
  { id: 2, nombre: 'Gestión de Proyectos', descripcion: 'Flujo de implementación de proyectos desde kick-off hasta go-live', tipo: 'proyecto', estado: 'activo', etapas: 8, instanciasActivas: 8, ultimaModificacion: '2024-01-25' },
  { id: 3, nombre: 'Cambio de Alcance', descripcion: 'Flujo para solicitud y aprobación de cambios de alcance', tipo: 'aprobacion', estado: 'activo', etapas: 4, instanciasActivas: 3, ultimaModificacion: '2024-01-20' },
  { id: 4, nombre: 'Solicitud de Compras', descripcion: 'Flujo de adquisiciones sin contrato marco', tipo: 'compras', estado: 'borrador', etapas: 5, instanciasActivas: 0, ultimaModificacion: '2024-02-08' },
];

const tipoColors = {
  iniciativa: 'bg-blue-100 text-blue-700',
  proyecto: 'bg-purple-100 text-purple-700',
  aprobacion: 'bg-amber-100 text-amber-700',
  compras: 'bg-green-100 text-green-700',
};

const tipoLabels = {
  iniciativa: 'Iniciativa',
  proyecto: 'Proyecto',
  aprobacion: 'Aprobación',
  compras: 'Compras',
};

const estadoColors = {
  activo: 'bg-green-100 text-green-700',
  borrador: 'bg-gray-100 text-gray-700',
  inactivo: 'bg-red-100 text-red-700',
};

export default function FlujosTrabajo() {
  const [selectedFlujo, setSelectedFlujo] = useState<FlujoTrabajo | null>(null);

  const stats = {
    totalFlujos: flujos.length,
    activos: flujos.filter((f) => f.estado === 'activo').length,
    instanciasActivas: flujos.reduce((acc, f) => acc + f.instanciasActivas, 0),
    etapasPromedio: Math.round(flujos.reduce((acc, f) => acc + f.etapas, 0) / flujos.length),
  };

  // Sample workflow stages for visualization
  const etapasEjemplo = [
    { nombre: 'Registro', estado: 'completado' },
    { nombre: 'Evaluación', estado: 'completado' },
    { nombre: 'Comité', estado: 'actual' },
    { nombre: 'Aprobación', estado: 'pendiente' },
    { nombre: 'Activación', estado: 'pendiente' },
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
          <p className="text-gray-500 mt-1">Configuración de workflows del sistema</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo Flujo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Flujos"
          value={stats.totalFlujos}
          icon={GitBranch}
          color="primary"
        />
        <KPICard
          title="Flujos Activos"
          value={stats.activos}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Instancias Activas"
          value={stats.instanciasActivas}
          icon={Clock}
          color="warning"
        />
        <KPICard
          title="Etapas Promedio"
          value={stats.etapasPromedio}
          icon={GitBranch}
          color="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="lg:col-span-2 space-y-4">
          {flujos.map((flujo) => (
            <div
              key={flujo.id}
              onClick={() => setSelectedFlujo(flujo)}
              className={`bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-accent/50 transition-colors ${
                selectedFlujo?.id === flujo.id ? 'border-accent ring-1 ring-accent/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{flujo.nombre}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${estadoColors[flujo.estado]}`}>
                      {flujo.estado.charAt(0).toUpperCase() + flujo.estado.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{flujo.descripcion}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${tipoColors[flujo.tipo]}`}>
                  {tipoLabels[flujo.tipo]}
                </span>
              </div>

              <div className="flex items-center gap-6 mt-4 text-sm">
                <div>
                  <span className="text-gray-500">Etapas</span>
                  <p className="font-medium text-gray-900">{flujo.etapas}</p>
                </div>
                <div>
                  <span className="text-gray-500">Instancias Activas</span>
                  <p className="font-medium text-gray-900">{flujo.instanciasActivas}</p>
                </div>
                <div>
                  <span className="text-gray-500">Última Modificación</span>
                  <p className="font-medium text-gray-900">
                    {new Date(flujo.ultimaModificacion).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {selectedFlujo ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedFlujo.nombre}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedFlujo.descripcion}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa del Flujo</h4>
                <div className="space-y-3">
                  {etapasEjemplo.map((etapa, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        etapa.estado === 'completado' ? 'bg-green-100 text-green-600' :
                        etapa.estado === 'actual' ? 'bg-accent text-white' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {etapa.estado === 'completado' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : etapa.estado === 'actual' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm ${
                        etapa.estado === 'actual' ? 'font-medium text-gray-900' : 'text-gray-600'
                      }`}>
                        {etapa.nombre}
                      </span>
                      {index < etapasEjemplo.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-300 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                  Editar Flujo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <GitBranch className="h-12 w-12 mb-3" />
              <p className="text-sm">Seleccione un flujo para ver detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
