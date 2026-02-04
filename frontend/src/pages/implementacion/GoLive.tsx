import { useState } from 'react';
import {
  PlayCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Rocket,
  Shield,
  Activity,
  Users,
  Server,
  RefreshCw,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { Timeline } from '../../components/ui/Timeline';

interface GoLiveTask {
  id: string;
  nombre: string;
  hora: string;
  estado: 'completada' | 'en_progreso' | 'pendiente' | 'error';
  responsable: string;
  duracionEstimada: string;
}

interface ProyectoGoLive {
  id: number;
  codigo: string;
  nombre: string;
  fechaGoLive: string;
  horaInicio: string;
  estado: 'preparacion' | 'en_curso' | 'completado' | 'rollback';
  tareas: GoLiveTask[];
  metricas: {
    disponibilidad: number;
    errores: number;
    usuariosActivos: number;
    transacciones: number;
  };
}

const proyecto: ProyectoGoLive = {
  id: 1,
  codigo: 'PRY-001',
  nombre: 'Modernización ERP',
  fechaGoLive: '2024-03-01',
  horaInicio: '22:00',
  estado: 'preparacion',
  tareas: [
    { id: '1', nombre: 'Backup de base de datos', hora: '22:00', estado: 'pendiente', responsable: 'Carlos López', duracionEstimada: '30 min' },
    { id: '2', nombre: 'Desactivar sistema actual', hora: '22:30', estado: 'pendiente', responsable: 'Carlos López', duracionEstimada: '15 min' },
    { id: '3', nombre: 'Despliegue de nueva versión', hora: '22:45', estado: 'pendiente', responsable: 'Juan Pérez', duracionEstimada: '45 min' },
    { id: '4', nombre: 'Migración final de datos', hora: '23:30', estado: 'pendiente', responsable: 'Carlos López', duracionEstimada: '1 hora' },
    { id: '5', nombre: 'Verificación de integraciones', hora: '00:30', estado: 'pendiente', responsable: 'Juan Pérez', duracionEstimada: '30 min' },
    { id: '6', nombre: 'Pruebas de humo', hora: '01:00', estado: 'pendiente', responsable: 'María García', duracionEstimada: '45 min' },
    { id: '7', nombre: 'Activación para usuarios', hora: '01:45', estado: 'pendiente', responsable: 'Juan Pérez', duracionEstimada: '15 min' },
    { id: '8', nombre: 'Monitoreo inicial', hora: '02:00', estado: 'pendiente', responsable: 'Equipo', duracionEstimada: '2 horas' },
  ],
  metricas: {
    disponibilidad: 99.9,
    errores: 0,
    usuariosActivos: 0,
    transacciones: 0,
  },
};

const estadoConfig = {
  completada: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  en_progreso: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  pendiente: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100' },
  error: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
};

export default function GoLive() {
  const [selectedProyecto] = useState<ProyectoGoLive>(proyecto);

  const timelineItems = selectedProyecto.tareas.map((tarea) => ({
    id: tarea.id,
    title: tarea.nombre,
    description: `${tarea.hora} • ${tarea.responsable} • ${tarea.duracionEstimada}`,
    status: tarea.estado === 'completada' ? 'completed' as const :
            tarea.estado === 'en_progreso' ? 'current' as const :
            tarea.estado === 'error' ? 'error' as const : 'pending' as const,
  }));

  const tareasCompletadas = selectedProyecto.tareas.filter((t) => t.estado === 'completada').length;
  const totalTareas = selectedProyecto.tareas.length;
  const avance = Math.round((tareasCompletadas / totalTareas) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PlayCircle className="h-7 w-7 text-accent" />
            Go-Live
          </h1>
          <p className="text-gray-500 mt-1">Ejecución del despliegue a producción</p>
        </div>
        {selectedProyecto.estado === 'preparacion' && (
          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <Rocket className="h-5 w-5" />
            Iniciar Go-Live
          </button>
        )}
      </div>

      {/* Project Info */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm opacity-80">{selectedProyecto.codigo}</span>
            <h2 className="text-2xl font-bold mt-1">{selectedProyecto.nombre}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm opacity-90">
                Fecha: {new Date(selectedProyecto.fechaGoLive).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <span className="text-sm opacity-90">Hora inicio: {selectedProyecto.horaInicio}</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            selectedProyecto.estado === 'completado' ? 'bg-green-500' :
            selectedProyecto.estado === 'en_curso' ? 'bg-blue-500' :
            selectedProyecto.estado === 'rollback' ? 'bg-red-500' : 'bg-white/20'
          }`}>
            <span className="text-sm font-medium">
              {selectedProyecto.estado === 'preparacion' ? 'En Preparación' :
               selectedProyecto.estado === 'en_curso' ? 'En Curso' :
               selectedProyecto.estado === 'completado' ? 'Completado' : 'Rollback'}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">Progreso del Go-Live</span>
            <span className="text-sm font-medium">{avance}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${avance}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Disponibilidad"
          value={`${selectedProyecto.metricas.disponibilidad}%`}
          icon={Activity}
          color={selectedProyecto.metricas.disponibilidad >= 99 ? 'success' : 'danger'}
        />
        <KPICard
          title="Errores"
          value={selectedProyecto.metricas.errores}
          icon={AlertTriangle}
          color={selectedProyecto.metricas.errores === 0 ? 'success' : 'danger'}
        />
        <KPICard
          title="Usuarios Activos"
          value={selectedProyecto.metricas.usuariosActivos}
          icon={Users}
          color="primary"
        />
        <KPICard
          title="Transacciones"
          value={selectedProyecto.metricas.transacciones}
          icon={RefreshCw}
          color="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Ejecución</h3>
          <Timeline items={timelineItems} />
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Server className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Ver logs del sistema</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Activity className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Dashboard de monitoreo</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <RefreshCw className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">Ejecutar Rollback</span>
              </button>
            </div>
          </div>

          {/* Rollback Plan */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800">Plan de Rollback</h4>
                <p className="text-xs text-amber-700 mt-1">
                  En caso de problemas críticos, el rollback restaurará el sistema a su estado anterior en aprox. 30 minutos.
                </p>
                <button className="text-xs text-amber-800 font-medium mt-2 hover:underline">
                  Ver documento de rollback →
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contactos de Emergencia</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Líder Técnico</span>
                <span className="font-medium">+56 9 1234 5678</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">DBA</span>
                <span className="font-medium">+56 9 2345 6789</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Soporte Infra</span>
                <span className="font-medium">+56 9 3456 7890</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detalle de Tareas</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Tarea</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Hora</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Responsable</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Duración Est.</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {selectedProyecto.tareas.map((tarea) => {
              const config = estadoConfig[tarea.estado];
              const Icon = config.icon;

              return (
                <tr key={tarea.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{tarea.nombre}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tarea.hora}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tarea.responsable}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tarea.duracionEstimada}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${config.bg}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <span className={`text-sm capitalize ${config.color}`}>{tarea.estado.replace('_', ' ')}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
