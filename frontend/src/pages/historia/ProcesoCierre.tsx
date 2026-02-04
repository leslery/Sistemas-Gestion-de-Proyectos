import { useState } from 'react';
import {
  CheckCircle2,
  FileCheck,
  Users,
  Calendar,
  AlertCircle,
  ChevronRight,
  FileText,
  Download,
  Clock,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { Timeline } from '../../components/ui/Timeline';

interface ProyectoCierre {
  id: number;
  codigo: string;
  nombre: string;
  gerencia: string;
  fechaInicioProyecto: string;
  fechaFinPlanificada: string;
  fechaFinReal: string;
  porcentajeAvance: number;
  etapaCierre: 'documentacion' | 'validacion' | 'lecciones' | 'firmas' | 'completado';
  responsable: string;
  pendientes: number;
}

const proyectosCierre: ProyectoCierre[] = [
  { id: 1, codigo: 'PRY-008', nombre: 'Migración Base de Datos', gerencia: 'TI', fechaInicioProyecto: '2023-06-01', fechaFinPlanificada: '2024-01-15', fechaFinReal: '2024-01-20', porcentajeAvance: 100, etapaCierre: 'lecciones', responsable: 'Carlos López', pendientes: 2 },
  { id: 2, codigo: 'PRY-012', nombre: 'Sistema de Inventarios', gerencia: 'Operaciones', fechaInicioProyecto: '2023-08-01', fechaFinPlanificada: '2024-02-01', fechaFinReal: '2024-02-05', porcentajeAvance: 100, etapaCierre: 'firmas', responsable: 'María García', pendientes: 1 },
  { id: 3, codigo: 'PRY-015', nombre: 'Portal de Proveedores', gerencia: 'Compras', fechaInicioProyecto: '2023-09-15', fechaFinPlanificada: '2024-01-30', fechaFinReal: '2024-01-28', porcentajeAvance: 100, etapaCierre: 'documentacion', responsable: 'Juan Pérez', pendientes: 5 },
];

const etapasCierre = [
  { id: 'documentacion', nombre: 'Documentación Final', descripcion: 'Compilar entregables y documentación' },
  { id: 'validacion', nombre: 'Validación Cliente', descripcion: 'Aprobación formal del cliente' },
  { id: 'lecciones', nombre: 'Lecciones Aprendidas', descripcion: 'Documentar experiencias y mejoras' },
  { id: 'firmas', nombre: 'Firmas de Cierre', descripcion: 'Obtener firmas de aceptación' },
  { id: 'completado', nombre: 'Cierre Completado', descripcion: 'Proyecto archivado oficialmente' },
];

const etapaColors = {
  documentacion: 'bg-blue-100 text-blue-700',
  validacion: 'bg-purple-100 text-purple-700',
  lecciones: 'bg-amber-100 text-amber-700',
  firmas: 'bg-orange-100 text-orange-700',
  completado: 'bg-green-100 text-green-700',
};

export default function ProcesoCierre() {
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoCierre | null>(null);

  const stats = {
    enCierre: proyectosCierre.length,
    documentacion: proyectosCierre.filter((p) => p.etapaCierre === 'documentacion').length,
    pendientesFirma: proyectosCierre.filter((p) => p.etapaCierre === 'firmas').length,
    totalPendientes: proyectosCierre.reduce((acc, p) => acc + p.pendientes, 0),
  };

  const getEtapaIndex = (etapa: string) => {
    return etapasCierre.findIndex((e) => e.id === etapa);
  };

  const getTimelineItems = (proyecto: ProyectoCierre) => {
    const currentIndex = getEtapaIndex(proyecto.etapaCierre);
    return etapasCierre.map((etapa, index) => ({
      id: etapa.id,
      title: etapa.nombre,
      description: etapa.descripcion,
      date: '',
      status: index < currentIndex ? 'completed' as const :
              index === currentIndex ? 'current' as const : 'pending' as const,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-accent" />
            Proceso de Cierre
          </h1>
          <p className="text-gray-500 mt-1">Gestión del cierre formal de proyectos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Exportar Informe
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="En Proceso de Cierre"
          value={stats.enCierre}
          icon={Clock}
          color="primary"
        />
        <KPICard
          title="En Documentación"
          value={stats.documentacion}
          icon={FileText}
          color="default"
        />
        <KPICard
          title="Pendientes Firma"
          value={stats.pendientesFirma}
          icon={Users}
          color="warning"
        />
        <KPICard
          title="Tareas Pendientes"
          value={stats.totalPendientes}
          icon={AlertCircle}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Proyectos en Cierre</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {proyectosCierre.map((proyecto) => (
              <div
                key={proyecto.id}
                onClick={() => setSelectedProyecto(proyecto)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedProyecto?.id === proyecto.id ? 'bg-accent/5 border-l-4 border-accent' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-accent">{proyecto.codigo}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${etapaColors[proyecto.etapaCierre]}`}>
                        {etapasCierre.find((e) => e.id === proyecto.etapaCierre)?.nombre}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">{proyecto.nombre}</p>
                    <p className="text-xs text-gray-500 mt-1">{proyecto.gerencia} · {proyecto.responsable}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {proyecto.pendientes > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {proyecto.pendientes} pendientes
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Progress bar showing closure stages */}
                <div className="mt-3">
                  <div className="flex items-center gap-1">
                    {etapasCierre.map((etapa, index) => {
                      const currentIndex = getEtapaIndex(proyecto.etapaCierre);
                      const isCompleted = index < currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div
                          key={etapa.id}
                          className={`h-1.5 flex-1 rounded-full ${
                            isCompleted ? 'bg-green-500' :
                            isCurrent ? 'bg-accent' : 'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {selectedProyecto ? (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-medium text-accent">{selectedProyecto.codigo}</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-1">{selectedProyecto.nombre}</h3>
                <p className="text-sm text-gray-500">{selectedProyecto.gerencia}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Responsable</span>
                  <span className="font-medium">{selectedProyecto.responsable}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Inicio Proyecto</span>
                  <span className="font-medium">
                    {new Date(selectedProyecto.fechaInicioProyecto).toLocaleDateString('es-CL')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Fin Planificado</span>
                  <span className="font-medium">
                    {new Date(selectedProyecto.fechaFinPlanificada).toLocaleDateString('es-CL')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Fin Real</span>
                  <span className="font-medium">
                    {new Date(selectedProyecto.fechaFinReal).toLocaleDateString('es-CL')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Progreso de Cierre</h4>
                <Timeline
                  items={getTimelineItems(selectedProyecto)}
                  orientation="vertical"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                  Gestionar Cierre
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileCheck className="h-12 w-12 mb-3" />
              <p className="text-sm">Seleccione un proyecto para ver detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
