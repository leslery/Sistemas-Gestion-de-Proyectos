import { useState } from 'react';
import {
  CalendarClock,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface Tarea {
  id: number;
  nombre: string;
  proyecto: string;
  inicio: string;
  fin: string;
  avance: number;
  responsable: string;
  estado: 'completada' | 'en_progreso' | 'atrasada' | 'pendiente';
}

const tareas: Tarea[] = [
  { id: 1, nombre: 'Diseño de arquitectura', proyecto: 'Modernización ERP', inicio: '2024-01-15', fin: '2024-02-15', avance: 100, responsable: 'Carlos López', estado: 'completada' },
  { id: 2, nombre: 'Desarrollo módulo ventas', proyecto: 'Modernización ERP', inicio: '2024-02-01', fin: '2024-03-15', avance: 45, responsable: 'Juan Pérez', estado: 'en_progreso' },
  { id: 3, nombre: 'Integración SAP', proyecto: 'Modernización ERP', inicio: '2024-02-20', fin: '2024-03-01', avance: 20, responsable: 'Carlos López', estado: 'atrasada' },
  { id: 4, nombre: 'Pruebas de usuario', proyecto: 'Portal Autoatención', inicio: '2024-03-01', fin: '2024-03-20', avance: 0, responsable: 'María García', estado: 'pendiente' },
  { id: 5, nombre: 'Migración de datos', proyecto: 'Sistema CRM', inicio: '2024-02-10', fin: '2024-02-28', avance: 80, responsable: 'Juan Pérez', estado: 'en_progreso' },
];

export default function ControlPlanificacion() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterProyecto, setFilterProyecto] = useState<string>('all');

  const proyectos = [...new Set(tareas.map((t) => t.proyecto))];

  const filteredTareas = tareas.filter((t) => {
    if (filterEstado !== 'all' && t.estado !== filterEstado) return false;
    if (filterProyecto !== 'all' && t.proyecto !== filterProyecto) return false;
    return true;
  });

  const stats = {
    total: tareas.length,
    completadas: tareas.filter((t) => t.estado === 'completada').length,
    atrasadas: tareas.filter((t) => t.estado === 'atrasada').length,
    enProgreso: tareas.filter((t) => t.estado === 'en_progreso').length,
  };

  const estadoConfig = {
    completada: { color: 'bg-green-500', label: 'Completada', icon: CheckCircle },
    en_progreso: { color: 'bg-blue-500', label: 'En Progreso', icon: Clock },
    atrasada: { color: 'bg-red-500', label: 'Atrasada', icon: AlertTriangle },
    pendiente: { color: 'bg-gray-300', label: 'Pendiente', icon: Clock },
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="h-7 w-7 text-accent" />
            Control de Planificación
          </h1>
          <p className="text-gray-500 mt-1">Seguimiento de cronogramas y hitos</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Tareas"
          value={stats.total}
          icon={CalendarClock}
          color="primary"
        />
        <KPICard
          title="Completadas"
          value={stats.completadas}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="En Progreso"
          value={stats.enProgreso}
          icon={Clock}
          color="primary"
        />
        <KPICard
          title="Atrasadas"
          value={stats.atrasadas}
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={filterProyecto}
          onChange={(e) => setFilterProyecto(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los proyectos</option>
          {proyectos.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los estados</option>
          <option value="completada">Completada</option>
          <option value="en_progreso">En Progreso</option>
          <option value="atrasada">Atrasada</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>

      {/* Gantt-like Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 min-w-[200px]">Tarea</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 min-w-[150px]">Proyecto</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3 min-w-[100px]">Avance</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 min-w-[120px]">Responsable</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3 min-w-[100px]">Estado</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 min-w-[200px]">Cronograma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTareas.map((tarea) => {
                const config = estadoConfig[tarea.estado];
                const Icon = config.icon;

                return (
                  <tr key={tarea.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{tarea.nombre}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tarea.proyecto}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={config.color}
                            style={{ width: `${tarea.avance}%`, height: '100%' }}
                          />
                        </div>
                        <span className="text-xs font-medium">{tarea.avance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tarea.responsable}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        tarea.estado === 'completada' ? 'bg-green-100 text-green-700' :
                        tarea.estado === 'atrasada' ? 'bg-red-100 text-red-700' :
                        tarea.estado === 'en_progreso' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(tarea.inicio).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                        </span>
                        <div className={`flex-1 h-4 rounded ${config.color}`} style={{ opacity: 0.7 }} />
                        <span className="text-xs text-gray-500">
                          {new Date(tarea.fin).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
        {Object.entries(estadoConfig).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${value.color}`} />
            <span>{value.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
