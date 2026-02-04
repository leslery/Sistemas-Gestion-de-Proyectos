import { useState } from 'react';
import {
  Shield,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface Aprobacion {
  id: number;
  tipo: string;
  elemento: string;
  proyecto: string;
  solicitante: string;
  fechaSolicitud: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  aprobador?: string;
  fechaResolucion?: string;
}

const aprobaciones: Aprobacion[] = [
  { id: 1, tipo: 'Cambio de alcance', elemento: 'Nuevo módulo de reportes', proyecto: 'Modernización ERP', solicitante: 'Juan Pérez', fechaSolicitud: '2024-02-10', estado: 'pendiente' },
  { id: 2, tipo: 'Extensión presupuesto', elemento: 'Incremento $50M', proyecto: 'Portal Autoatención', solicitante: 'María García', fechaSolicitud: '2024-02-08', estado: 'aprobada', aprobador: 'Director TI', fechaResolucion: '2024-02-12' },
  { id: 3, tipo: 'Cambio de cronograma', elemento: 'Extensión 2 semanas', proyecto: 'Sistema CRM', solicitante: 'Carlos López', fechaSolicitud: '2024-02-05', estado: 'pendiente' },
  { id: 4, tipo: 'Cambio tecnológico', elemento: 'Migración a AWS', proyecto: 'Modernización ERP', solicitante: 'Juan Pérez', fechaSolicitud: '2024-02-01', estado: 'rechazada', aprobador: 'Comité Técnico', fechaResolucion: '2024-02-07' },
];

export default function ControlGobernanza() {
  const [filterEstado, setFilterEstado] = useState<string>('all');

  const filteredAprobaciones = aprobaciones.filter((a) => {
    if (filterEstado !== 'all' && a.estado !== filterEstado) return false;
    return true;
  });

  const stats = {
    pendientes: aprobaciones.filter((a) => a.estado === 'pendiente').length,
    aprobadas: aprobaciones.filter((a) => a.estado === 'aprobada').length,
    rechazadas: aprobaciones.filter((a) => a.estado === 'rechazada').length,
    tiempoPromedio: 3.5,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent" />
            Control de Gobernanza
          </h1>
          <p className="text-gray-500 mt-1">Gestión de aprobaciones y cambios</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Pendientes de Aprobación"
          value={stats.pendientes}
          icon={Clock}
          color="warning"
        />
        <KPICard
          title="Aprobadas"
          value={stats.aprobadas}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Rechazadas"
          value={stats.rechazadas}
          icon={AlertTriangle}
          color="danger"
        />
        <KPICard
          title="Tiempo Promedio"
          value={`${stats.tiempoPromedio} días`}
          icon={Calendar}
          color="primary"
          subtitle="Para resolución"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {/* Approvals List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Solicitud</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proyecto</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Solicitante</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Fecha</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAprobaciones.map((aprobacion) => (
              <tr key={aprobacion.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{aprobacion.tipo}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{aprobacion.elemento}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{aprobacion.proyecto}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{aprobacion.solicitante}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(aprobacion.fechaSolicitud).toLocaleDateString('es-CL')}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    aprobacion.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                    aprobacion.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {aprobacion.estado.charAt(0).toUpperCase() + aprobacion.estado.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-accent hover:text-accent/80">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
