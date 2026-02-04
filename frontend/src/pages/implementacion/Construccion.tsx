import { useState } from 'react';
import {
  Hammer,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Code,
  GitBranch,
  Bug,
  ChevronRight,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { FaseTimeline, Fase } from '../../components/workflow/FaseTimeline';

interface Sprint {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'completado' | 'en_progreso' | 'planificado';
  historias: { total: number; completadas: number };
  bugs: number;
}

interface ProyectoConstruccion {
  id: number;
  codigo: string;
  nombre: string;
  avance: number;
  sprints: Sprint[];
  tecnologias: string[];
  repositorio?: string;
}

const proyectos: ProyectoConstruccion[] = [
  {
    id: 1,
    codigo: 'PRY-001',
    nombre: 'Modernización ERP',
    avance: 45,
    tecnologias: ['React', 'Node.js', 'PostgreSQL'],
    repositorio: 'gitlab.cge.cl/erp-modern',
    sprints: [
      { id: 1, nombre: 'Sprint 1', fechaInicio: '2024-01-15', fechaFin: '2024-01-29', estado: 'completado', historias: { total: 8, completadas: 8 }, bugs: 2 },
      { id: 2, nombre: 'Sprint 2', fechaInicio: '2024-01-29', fechaFin: '2024-02-12', estado: 'completado', historias: { total: 10, completadas: 10 }, bugs: 1 },
      { id: 3, nombre: 'Sprint 3', fechaInicio: '2024-02-12', fechaFin: '2024-02-26', estado: 'en_progreso', historias: { total: 12, completadas: 5 }, bugs: 3 },
      { id: 4, nombre: 'Sprint 4', fechaInicio: '2024-02-26', fechaFin: '2024-03-11', estado: 'planificado', historias: { total: 10, completadas: 0 }, bugs: 0 },
    ],
  },
  {
    id: 2,
    codigo: 'PRY-002',
    nombre: 'Portal Autoatención',
    avance: 78,
    tecnologias: ['Vue.js', 'Python', 'MongoDB'],
    sprints: [
      { id: 1, nombre: 'Sprint 1', fechaInicio: '2024-01-08', fechaFin: '2024-01-22', estado: 'completado', historias: { total: 6, completadas: 6 }, bugs: 0 },
      { id: 2, nombre: 'Sprint 2', fechaInicio: '2024-01-22', fechaFin: '2024-02-05', estado: 'completado', historias: { total: 8, completadas: 8 }, bugs: 2 },
      { id: 3, nombre: 'Sprint 3', fechaInicio: '2024-02-05', fechaFin: '2024-02-19', estado: 'en_progreso', historias: { total: 7, completadas: 6 }, bugs: 1 },
    ],
  },
];

export default function Construccion() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoConstruccion | null>(proyectos[0]);

  const filteredProyectos = proyectos.filter((p) =>
    !searchQuery || p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || p.codigo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sprintActual = selectedProyecto?.sprints.find((s) => s.estado === 'en_progreso');
  const sprintsCompletados = selectedProyecto?.sprints.filter((s) => s.estado === 'completado').length || 0;
  const totalSprints = selectedProyecto?.sprints.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Hammer className="h-7 w-7 text-accent" />
            Construcción
          </h1>
          <p className="text-gray-500 mt-1">Seguimiento del desarrollo y sprints</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Proyectos en Construcción"
          value={proyectos.length}
          icon={Hammer}
          color="primary"
        />
        <KPICard
          title="Sprints Activos"
          value={proyectos.filter((p) => p.sprints.some((s) => s.estado === 'en_progreso')).length}
          icon={Clock}
          color="warning"
        />
        <KPICard
          title="Historias Completadas"
          value={proyectos.reduce((acc, p) => acc + p.sprints.reduce((a, s) => a + s.historias.completadas, 0), 0)}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Bugs Abiertos"
          value={proyectos.reduce((acc, p) => acc + p.sprints.filter((s) => s.estado === 'en_progreso').reduce((a, s) => a + s.bugs, 0), 0)}
          icon={Bug}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proyecto..."
              className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
          </div>

          {filteredProyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              onClick={() => setSelectedProyecto(proyecto)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                selectedProyecto?.id === proyecto.id
                  ? 'border-accent shadow-md'
                  : 'border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-accent">{proyecto.codigo}</span>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{proyecto.nombre}</p>
                </div>
                <span className="text-sm font-bold text-accent">{proyecto.avance}%</span>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${proyecto.avance}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {proyecto.tecnologias.map((tech) => (
                  <span key={tech} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sprint Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProyecto && (
            <>
              {/* Current Sprint */}
              {sprintActual && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Sprint Actual: {sprintActual.nombre}</h3>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full animate-pulse">
                      En Progreso
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{sprintActual.historias.completadas}/{sprintActual.historias.total}</p>
                      <p className="text-xs text-gray-500">Historias</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{sprintActual.bugs}</p>
                      <p className="text-xs text-gray-500">Bugs</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-accent">
                        {Math.ceil((new Date(sprintActual.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-xs text-gray-500">Días restantes</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progreso del Sprint</span>
                      <span className="font-medium">{Math.round((sprintActual.historias.completadas / sprintActual.historias.total) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${(sprintActual.historias.completadas / sprintActual.historias.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sprint Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline de Sprints</h3>
                <div className="space-y-3">
                  {selectedProyecto.sprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        sprint.estado === 'en_progreso' ? 'bg-blue-50 border border-blue-200' :
                        sprint.estado === 'completado' ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        sprint.estado === 'completado' ? 'bg-green-100 text-green-600' :
                        sprint.estado === 'en_progreso' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {sprint.estado === 'completado' ? <CheckCircle className="h-4 w-4" /> :
                         sprint.estado === 'en_progreso' ? <Clock className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{sprint.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(sprint.fechaInicio).toLocaleDateString('es-CL')} - {new Date(sprint.fechaFin).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{sprint.historias.completadas}/{sprint.historias.total}</p>
                        <p className="text-xs text-gray-500">historias</p>
                      </div>
                      {sprint.bugs > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                          {sprint.bugs} bugs
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Repository Link */}
              {selectedProyecto.repositorio && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Repositorio</p>
                    <p className="text-xs text-gray-500">{selectedProyecto.repositorio}</p>
                  </div>
                  <button className="text-accent text-sm font-medium hover:text-accent/80">
                    Abrir
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
