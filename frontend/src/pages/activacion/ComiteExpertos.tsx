import { useState } from 'react';
import {
  UserCheck,
  Calendar,
  Plus,
  Play,
  Users,
  CheckCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface Sesion {
  id: number;
  fecha: string;
  estado: 'programada' | 'en_curso' | 'finalizada';
  iniciativasAgendadas: number;
  participantes: string[];
  resultados?: {
    aprobadas: number;
    rechazadas: number;
    conVeto: number;
  };
}

interface IniciativaPendiente {
  id: number;
  codigo: string;
  titulo: string;
  area: string;
  monto: number;
  prioridad: string;
  votosRecibidos: number;
  votosRequeridos: number;
}

const sesiones: Sesion[] = [
  {
    id: 1,
    fecha: '2024-02-20',
    estado: 'programada',
    iniciativasAgendadas: 5,
    participantes: ['Juan Pérez', 'María García', 'Carlos López', 'Ana Rodríguez'],
  },
  {
    id: 2,
    fecha: '2024-02-13',
    estado: 'finalizada',
    iniciativasAgendadas: 4,
    participantes: ['Juan Pérez', 'María García', 'Carlos López'],
    resultados: { aprobadas: 3, rechazadas: 1, conVeto: 0 },
  },
  {
    id: 3,
    fecha: '2024-02-06',
    estado: 'finalizada',
    iniciativasAgendadas: 6,
    participantes: ['Juan Pérez', 'María García', 'Carlos López', 'Ana Rodríguez'],
    resultados: { aprobadas: 4, rechazadas: 1, conVeto: 1 },
  },
];

const iniciativasPendientes: IniciativaPendiente[] = [
  { id: 1, codigo: 'INI-0045', titulo: 'Modernización ERP', area: 'TI', monto: 500000000, prioridad: 'P1', votosRecibidos: 2, votosRequeridos: 5 },
  { id: 2, codigo: 'INI-0046', titulo: 'Portal Autoatención', area: 'Comercial', monto: 200000000, prioridad: 'P2', votosRecibidos: 3, votosRequeridos: 5 },
  { id: 3, codigo: 'INI-0047', titulo: 'Automatización RRHH', area: 'RRHH', monto: 80000000, prioridad: 'P3', votosRecibidos: 1, votosRequeridos: 5 },
];

export default function ComiteExpertos() {
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null);

  const sesionesFinalizadas = sesiones.filter((s) => s.estado === 'finalizada');
  const totalAprobadas = sesionesFinalizadas.reduce((acc, s) => acc + (s.resultados?.aprobadas || 0), 0);
  const totalRechazadas = sesionesFinalizadas.reduce((acc, s) => acc + (s.resultados?.rechazadas || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-accent" />
            Comité de Expertos
          </h1>
          <p className="text-gray-500 mt-1">Sesiones de evaluación y votaciones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Programar Sesión
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Sesiones del Mes"
          value={sesiones.length}
          icon={Calendar}
          color="primary"
        />
        <KPICard
          title="Iniciativas Aprobadas"
          value={totalAprobadas}
          icon={ThumbsUp}
          color="success"
        />
        <KPICard
          title="Iniciativas Rechazadas"
          value={totalRechazadas}
          icon={ThumbsDown}
          color="danger"
        />
        <KPICard
          title="Pendientes de Voto"
          value={iniciativasPendientes.length}
          icon={Clock}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Sesiones */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sesiones Programadas</h3>
          </div>
          <div className="space-y-3">
            {sesiones
              .filter((s) => s.estado !== 'finalizada')
              .map((sesion) => (
                <div
                  key={sesion.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => setSelectedSesion(sesion)}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    sesion.estado === 'en_curso' ? 'bg-green-100 text-green-600' : 'bg-accent/10 text-accent'
                  }`}>
                    {sesion.estado === 'en_curso' ? (
                      <Play className="h-6 w-6" />
                    ) : (
                      <Calendar className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(sesion.fecha).toLocaleDateString('es-CL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sesion.iniciativasAgendadas} iniciativas · {sesion.participantes.length} participantes
                    </p>
                  </div>
                  {sesion.estado === 'en_curso' && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full animate-pulse">
                      En curso
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
          </div>
        </div>

        {/* Iniciativas Pendientes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Iniciativas en Votación</h3>
          </div>
          <div className="space-y-3">
            {iniciativasPendientes.map((iniciativa) => (
              <div
                key={iniciativa.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-medium text-accent">{iniciativa.codigo}</span>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{iniciativa.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{iniciativa.area}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">
                        ${(iniciativa.monto / 1000000).toFixed(0)}M
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    iniciativa.prioridad === 'P1' ? 'bg-red-100 text-red-700' :
                    iniciativa.prioridad === 'P2' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {iniciativa.prioridad}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(iniciativa.votosRecibidos / iniciativa.votosRequeridos) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {iniciativa.votosRecibidos}/{iniciativa.votosRequeridos} votos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historial de Sesiones */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Sesiones</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Fecha</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Iniciativas</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Aprobadas</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Rechazadas</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Con Veto</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Participantes</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sesiones.filter((s) => s.estado === 'finalizada').map((sesion) => (
                <tr key={sesion.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(sesion.fecha).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {sesion.iniciativasAgendadas}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                      <ThumbsUp className="h-4 w-4" />
                      {sesion.resultados?.aprobadas}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                      <ThumbsDown className="h-4 w-4" />
                      {sesion.resultados?.rechazadas}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {sesion.resultados?.conVeto ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        {sesion.resultados.conVeto}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex -space-x-2">
                        {sesion.participantes.slice(0, 3).map((p, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center ring-2 ring-white"
                            title={p}
                          >
                            {p.charAt(0)}
                          </div>
                        ))}
                        {sesion.participantes.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center ring-2 ring-white">
                            +{sesion.participantes.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-accent hover:text-accent/80 text-sm font-medium">
                      Ver acta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
