import { useState } from 'react';
import {
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  AlertTriangle,
  FileText,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface ProyectoRechazado {
  id: number;
  codigo: string;
  nombre: string;
  gerencia: string;
  solicitante: string;
  fechaSolicitud: string;
  fechaRechazo: string;
  etapaRechazo: string;
  motivoRechazo: string;
  categoriaRechazo: 'viabilidad_tecnica' | 'viabilidad_financiera' | 'alineacion_estrategica' | 'recursos' | 'duplicidad' | 'otro';
  presupuestoSolicitado: number;
  comiteDecision: string;
}

const proyectosRechazados: ProyectoRechazado[] = [
  { id: 1, codigo: 'INI-045', nombre: 'App Móvil de Ventas', gerencia: 'Comercial', solicitante: 'Pedro Martínez', fechaSolicitud: '2024-01-10', fechaRechazo: '2024-01-25', etapaRechazo: 'Comité de Expertos', motivoRechazo: 'No existe capacidad técnica interna y el costo de tercerización excede el presupuesto disponible', categoriaRechazo: 'viabilidad_tecnica', presupuestoSolicitado: 350000000, comiteDecision: 'Comité Técnico' },
  { id: 2, codigo: 'INI-048', nombre: 'Sistema de IoT Industrial', gerencia: 'Operaciones', solicitante: 'Ana Rodríguez', fechaSolicitud: '2024-01-15', fechaRechazo: '2024-02-01', etapaRechazo: 'Informe de Factibilidad', motivoRechazo: 'ROI negativo en horizonte de 5 años. Inversión inicial muy alta sin beneficios cuantificables claros', categoriaRechazo: 'viabilidad_financiera', presupuestoSolicitado: 890000000, comiteDecision: 'Comité Financiero' },
  { id: 3, codigo: 'INI-052', nombre: 'Chatbot de Atención', gerencia: 'Servicio al Cliente', solicitante: 'Luis García', fechaSolicitud: '2024-01-20', fechaRechazo: '2024-02-05', etapaRechazo: 'Evaluación Inicial', motivoRechazo: 'Proyecto similar ya en ejecución por área de TI. Se recomienda colaborar en proyecto existente', categoriaRechazo: 'duplicidad', presupuestoSolicitado: 180000000, comiteDecision: 'PMO' },
  { id: 4, codigo: 'INI-055', nombre: 'Plataforma Blockchain', gerencia: 'Finanzas', solicitante: 'Carlos López', fechaSolicitud: '2024-02-01', fechaRechazo: '2024-02-15', etapaRechazo: 'Planificación Estratégica', motivoRechazo: 'No se alinea con objetivos estratégicos del período. Tecnología aún inmadura para casos de uso propuestos', categoriaRechazo: 'alineacion_estrategica', presupuestoSolicitado: 520000000, comiteDecision: 'Comité Estratégico' },
];

const categoriaLabels = {
  viabilidad_tecnica: 'Viabilidad Técnica',
  viabilidad_financiera: 'Viabilidad Financiera',
  alineacion_estrategica: 'Alineación Estratégica',
  recursos: 'Falta de Recursos',
  duplicidad: 'Duplicidad',
  otro: 'Otro',
};

const categoriaColors = {
  viabilidad_tecnica: 'bg-purple-100 text-purple-700',
  viabilidad_financiera: 'bg-red-100 text-red-700',
  alineacion_estrategica: 'bg-blue-100 text-blue-700',
  recursos: 'bg-amber-100 text-amber-700',
  duplicidad: 'bg-gray-100 text-gray-700',
  otro: 'bg-gray-100 text-gray-700',
};

export default function ProyectosRechazados() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoRechazado | null>(null);

  const categorias = [...new Set(proyectosRechazados.map((p) => p.categoriaRechazo))];

  const filteredProyectos = proyectosRechazados.filter((p) => {
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategoria !== 'all' && p.categoriaRechazo !== filterCategoria) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const stats = {
    totalRechazados: proyectosRechazados.length,
    presupuestoEvitado: proyectosRechazados.reduce((acc, p) => acc + p.presupuestoSolicitado, 0),
    porViabilidadTecnica: proyectosRechazados.filter((p) => p.categoriaRechazo === 'viabilidad_tecnica').length,
    porViabilidadFinanciera: proyectosRechazados.filter((p) => p.categoriaRechazo === 'viabilidad_financiera').length,
  };

  // Calculate distribution by category
  const distribucionCategorias = Object.entries(categoriaLabels).map(([key, label]) => ({
    categoria: key,
    label,
    count: proyectosRechazados.filter((p) => p.categoriaRechazo === key).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <XCircle className="h-7 w-7 text-accent" />
            Proyectos Rechazados
          </h1>
          <p className="text-gray-500 mt-1">Histórico de iniciativas no aprobadas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Exportar Análisis
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Rechazados"
          value={stats.totalRechazados}
          icon={XCircle}
          color="danger"
        />
        <KPICard
          title="Presupuesto Evitado"
          value={formatCurrency(stats.presupuestoEvitado)}
          icon={TrendingDown}
          color="success"
          subtitle="Inversión no ejecutada"
        />
        <KPICard
          title="Por Viabilidad Técnica"
          value={stats.porViabilidadTecnica}
          icon={AlertTriangle}
          color="warning"
        />
        <KPICard
          title="Por Viabilidad Financiera"
          value={stats.porViabilidadFinanciera}
          icon={BarChart3}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Motivo</h3>
          <div className="space-y-4">
            {distribucionCategorias.map((cat) => {
              const percentage = (cat.count / proyectosRechazados.length) * 100;
              return (
                <div key={cat.categoria}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.label}</span>
                    <span className="font-medium">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Insights</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <p>• La viabilidad financiera es el principal filtro de proyectos</p>
              <p>• 25% de rechazos son por duplicidad con proyectos existentes</p>
              <p>• Mejorar evaluación inicial reduciría rechazos tardíos</p>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar proyecto..."
                className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            >
              <option value="all">Todos los motivos</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{categoriaLabels[c]}</option>
              ))}
            </select>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proyecto</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Etapa</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Motivo</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Presupuesto</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProyectos.map((proyecto) => (
                  <tr
                    key={proyecto.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedProyecto?.id === proyecto.id ? 'bg-accent/5' : ''
                    }`}
                    onClick={() => setSelectedProyecto(proyecto)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-accent">{proyecto.codigo}</span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{proyecto.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{proyecto.gerencia} · {proyecto.solicitante}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{proyecto.etapaRechazo}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoriaColors[proyecto.categoriaRechazo]}`}>
                        {categoriaLabels[proyecto.categoriaRechazo]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(proyecto.presupuestoSolicitado)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedProyecto && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-medium text-accent">{selectedProyecto.codigo}</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">{selectedProyecto.nombre}</h3>
            </div>
            <button
              onClick={() => setSelectedProyecto(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Información General</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gerencia</span>
                    <span className="font-medium">{selectedProyecto.gerencia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Solicitante</span>
                    <span className="font-medium">{selectedProyecto.solicitante}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha Solicitud</span>
                    <span className="font-medium">{new Date(selectedProyecto.fechaSolicitud).toLocaleDateString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha Rechazo</span>
                    <span className="font-medium">{new Date(selectedProyecto.fechaRechazo).toLocaleDateString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Presupuesto Solicitado</span>
                    <span className="font-medium">{formatCurrency(selectedProyecto.presupuestoSolicitado)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Decisión de Rechazo</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoriaColors[selectedProyecto.categoriaRechazo]}`}>
                      {categoriaLabels[selectedProyecto.categoriaRechazo]}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedProyecto.motivoRechazo}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Decisión tomada por: <span className="font-medium">{selectedProyecto.comiteDecision}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <FileText className="h-4 w-4" />
              Ver Documentación Completa
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-accent bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors text-sm">
              Reabrir como Nueva Iniciativa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
