import { useState } from 'react';
import {
  PauseCircle,
  Search,
  Download,
  Eye,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  Play,
  XCircle,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface ProyectoSuspendido {
  id: number;
  codigo: string;
  nombre: string;
  gerencia: string;
  liderProyecto: string;
  fechaInicio: string;
  fechaSuspension: string;
  diasSuspendido: number;
  motivoSuspension: string;
  categoriaSuspension: 'presupuesto' | 'recursos' | 'prioridad' | 'externo' | 'revision';
  presupuestoAsignado: number;
  porcentajeAvance: number;
  faseSuspension: string;
}

const proyectosSuspendidos: ProyectoSuspendido[] = [
  { id: 1, codigo: 'PRY-018', nombre: 'Modernización ERP Logística', gerencia: 'Operaciones', liderProyecto: 'María González', fechaInicio: '2024-03-01', fechaSuspension: '2024-08-15', diasSuspendido: 45, motivoSuspension: 'Recorte presupuestario Q3. Se requiere reasignación de fondos para proyectos prioritarios', categoriaSuspension: 'presupuesto', presupuestoAsignado: 420000000, porcentajeAvance: 35, faseSuspension: 'Construcción' },
  { id: 2, codigo: 'PRY-022', nombre: 'Sistema de Analytics Avanzado', gerencia: 'TI', liderProyecto: 'Carlos Mendoza', fechaInicio: '2024-04-15', fechaSuspension: '2024-09-01', diasSuspendido: 30, motivoSuspension: 'Recursos clave reasignados a proyecto crítico de seguridad', categoriaSuspension: 'recursos', presupuestoAsignado: 280000000, porcentajeAvance: 45, faseSuspension: 'Análisis y Diseño' },
  { id: 3, codigo: 'PRY-025', nombre: 'Portal de Partners', gerencia: 'Comercial', liderProyecto: 'Ana Ruiz', fechaInicio: '2024-05-01', fechaSuspension: '2024-09-10', diasSuspendido: 25, motivoSuspension: 'Cambio en estrategia comercial. Esperando definición de nuevo modelo de partners', categoriaSuspension: 'revision', presupuestoAsignado: 180000000, porcentajeAvance: 20, faseSuspension: 'Kick Off' },
  { id: 4, codigo: 'PRY-028', nombre: 'Integración CRM-ERP', gerencia: 'Finanzas', liderProyecto: 'Roberto Silva', fechaInicio: '2024-06-01', fechaSuspension: '2024-09-20', diasSuspendido: 15, motivoSuspension: 'Proveedor de CRM en proceso de adquisición. Esperando definición contractual', categoriaSuspension: 'externo', presupuestoAsignado: 320000000, porcentajeAvance: 55, faseSuspension: 'Pruebas' },
  { id: 5, codigo: 'PRY-031', nombre: 'App Móvil Operaciones Campo', gerencia: 'Operaciones', liderProyecto: 'Patricia López', fechaInicio: '2024-07-01', fechaSuspension: '2024-10-01', diasSuspendido: 5, motivoSuspension: 'Repriorización por proyecto regulatorio urgente', categoriaSuspension: 'prioridad', presupuestoAsignado: 150000000, porcentajeAvance: 15, faseSuspension: 'Análisis y Diseño' },
  { id: 6, codigo: 'PRY-033', nombre: 'Sistema de Gestión Documental', gerencia: 'Legal', liderProyecto: 'Fernando Díaz', fechaInicio: '2024-07-15', fechaSuspension: '2024-10-05', diasSuspendido: 2, motivoSuspension: 'Revisión de requisitos normativos por nueva regulación', categoriaSuspension: 'revision', presupuestoAsignado: 95000000, porcentajeAvance: 10, faseSuspension: 'Kick Off' },
];

const categoriaLabels = {
  presupuesto: 'Presupuesto',
  recursos: 'Recursos',
  prioridad: 'Priorización',
  externo: 'Factor Externo',
  revision: 'En Revisión',
};

const categoriaColors = {
  presupuesto: 'bg-red-100 text-red-700',
  recursos: 'bg-amber-100 text-amber-700',
  prioridad: 'bg-blue-100 text-blue-700',
  externo: 'bg-purple-100 text-purple-700',
  revision: 'bg-gray-100 text-gray-700',
};

export default function ProyectosSuspendidos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoSuspendido | null>(null);

  const categorias = [...new Set(proyectosSuspendidos.map((p) => p.categoriaSuspension))];

  const filteredProyectos = proyectosSuspendidos.filter((p) => {
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategoria !== 'all' && p.categoriaSuspension !== filterCategoria) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const stats = {
    totalSuspendidos: proyectosSuspendidos.length,
    presupuestoCongelado: proyectosSuspendidos.reduce((acc, p) => acc + p.presupuestoAsignado, 0),
    diasPromedioSuspension: Math.round(proyectosSuspendidos.reduce((acc, p) => acc + p.diasSuspendido, 0) / proyectosSuspendidos.length),
    porPresupuesto: proyectosSuspendidos.filter((p) => p.categoriaSuspension === 'presupuesto').length,
  };

  const distribucionCategorias = Object.entries(categoriaLabels).map(([key, label]) => ({
    categoria: key,
    label,
    count: proyectosSuspendidos.filter((p) => p.categoriaSuspension === key).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PauseCircle className="h-7 w-7 text-accent" />
            Proyectos Suspendidos
          </h1>
          <p className="text-gray-500 mt-1">Proyectos temporalmente detenidos pendientes de reactivación</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Exportar Informe
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Proyectos Suspendidos"
          value={stats.totalSuspendidos}
          icon={PauseCircle}
          color="warning"
        />
        <KPICard
          title="Presupuesto Congelado"
          value={formatCurrency(stats.presupuestoCongelado)}
          icon={AlertTriangle}
          color="danger"
          subtitle="Capital inmovilizado"
        />
        <KPICard
          title="Días Promedio Suspensión"
          value={stats.diasPromedioSuspension}
          icon={Clock}
          color="default"
        />
        <KPICard
          title="Por Presupuesto"
          value={stats.porPresupuesto}
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Motivo</h3>
          <div className="space-y-4">
            {distribucionCategorias.map((cat) => {
              const percentage = (cat.count / proyectosSuspendidos.length) * 100;
              return (
                <div key={cat.categoria}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.label}</span>
                    <span className="font-medium">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Acciones Recomendadas</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <p>• Revisar proyectos suspendidos más de 30 días</p>
              <p>• Evaluar cancelación de proyectos sin fecha de retorno</p>
              <p>• Liberar recursos de proyectos con baja probabilidad de reactivación</p>
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
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Fase</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Avance</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Días</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Motivo</th>
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
                      <p className="text-xs text-gray-500 mt-0.5">{proyecto.gerencia} · {proyecto.liderProyecto}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{proyecto.faseSuspension}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${proyecto.porcentajeAvance}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{proyecto.porcentajeAvance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${
                        proyecto.diasSuspendido > 30 ? 'text-red-600' :
                        proyecto.diasSuspendido > 14 ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        {proyecto.diasSuspendido}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoriaColors[proyecto.categoriaSuspension]}`}>
                        {categoriaLabels[proyecto.categoriaSuspension]}
                      </span>
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
                <h4 className="text-sm font-medium text-gray-900 mb-2">Información del Proyecto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gerencia</span>
                    <span className="font-medium">{selectedProyecto.gerencia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Líder de Proyecto</span>
                    <span className="font-medium">{selectedProyecto.liderProyecto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha de Inicio</span>
                    <span className="font-medium">{new Date(selectedProyecto.fechaInicio).toLocaleDateString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha de Suspensión</span>
                    <span className="font-medium">{new Date(selectedProyecto.fechaSuspension).toLocaleDateString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Presupuesto Asignado</span>
                    <span className="font-medium">{formatCurrency(selectedProyecto.presupuestoAsignado)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Estado de Suspensión</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoriaColors[selectedProyecto.categoriaSuspension]}`}>
                      {categoriaLabels[selectedProyecto.categoriaSuspension]}
                    </span>
                    <span className="text-sm text-gray-500">· {selectedProyecto.diasSuspendido} días suspendido</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">{selectedProyecto.motivoSuspension}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Fase al suspenderse:</span>
                    <span className="font-medium">{selectedProyecto.faseSuspension}</span>
                    <span className="text-gray-400">({selectedProyecto.porcentajeAvance}% completado)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors text-sm">
              <Play className="h-4 w-4" />
              Reactivar Proyecto
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm">
              <XCircle className="h-4 w-4" />
              Cancelar Proyecto
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <FileText className="h-4 w-4" />
              Ver Historial Completo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
