import { useState } from 'react';
import {
  Archive,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface ProyectoCerrado {
  id: number;
  codigo: string;
  nombre: string;
  gerencia: string;
  sponsor: string;
  fechaInicio: string;
  fechaCierre: string;
  duracionMeses: number;
  presupuestoInicial: number;
  costoFinal: number;
  variacionCosto: number;
  cumplimientoAlcance: number;
  satisfaccionCliente: number;
  leccionesAprendidas: number;
}

const proyectosCerrados: ProyectoCerrado[] = [
  { id: 1, codigo: 'PRY-005', nombre: 'Sistema de Facturación Electrónica', gerencia: 'Finanzas', sponsor: 'CFO', fechaInicio: '2022-03-01', fechaCierre: '2023-06-30', duracionMeses: 16, presupuestoInicial: 450000000, costoFinal: 420000000, variacionCosto: -6.7, cumplimientoAlcance: 100, satisfaccionCliente: 4.5, leccionesAprendidas: 8 },
  { id: 2, codigo: 'PRY-007', nombre: 'Automatización de RRHH', gerencia: 'Recursos Humanos', sponsor: 'CHRO', fechaInicio: '2022-06-01', fechaCierre: '2023-09-15', duracionMeses: 15, presupuestoInicial: 280000000, costoFinal: 295000000, variacionCosto: 5.4, cumplimientoAlcance: 95, satisfaccionCliente: 4.2, leccionesAprendidas: 6 },
  { id: 3, codigo: 'PRY-009', nombre: 'Portal de Clientes v2', gerencia: 'Comercial', sponsor: 'CCO', fechaInicio: '2022-09-01', fechaCierre: '2023-12-20', duracionMeses: 15, presupuestoInicial: 520000000, costoFinal: 510000000, variacionCosto: -1.9, cumplimientoAlcance: 100, satisfaccionCliente: 4.8, leccionesAprendidas: 12 },
  { id: 4, codigo: 'PRY-011', nombre: 'Migración Cloud AWS', gerencia: 'TI', sponsor: 'CTO', fechaInicio: '2023-01-15', fechaCierre: '2024-01-10', duracionMeses: 12, presupuestoInicial: 680000000, costoFinal: 750000000, variacionCosto: 10.3, cumplimientoAlcance: 100, satisfaccionCliente: 4.0, leccionesAprendidas: 15 },
];

export default function ProyectosCerrados() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGerencia, setFilterGerencia] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  const gerencias = [...new Set(proyectosCerrados.map((p) => p.gerencia))];
  const years = [...new Set(proyectosCerrados.map((p) => new Date(p.fechaCierre).getFullYear().toString()))];

  const filteredProyectos = proyectosCerrados.filter((p) => {
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterGerencia !== 'all' && p.gerencia !== filterGerencia) return false;
    if (filterYear !== 'all' && new Date(p.fechaCierre).getFullYear().toString() !== filterYear) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const stats = {
    totalProyectos: proyectosCerrados.length,
    inversionTotal: proyectosCerrados.reduce((acc, p) => acc + p.costoFinal, 0),
    satisfaccionPromedio: (proyectosCerrados.reduce((acc, p) => acc + p.satisfaccionCliente, 0) / proyectosCerrados.length).toFixed(1),
    leccionesTotal: proyectosCerrados.reduce((acc, p) => acc + p.leccionesAprendidas, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Archive className="h-7 w-7 text-accent" />
            Proyectos Cerrados
          </h1>
          <p className="text-gray-500 mt-1">Histórico de proyectos completados exitosamente</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Exportar Histórico
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Proyectos Cerrados"
          value={stats.totalProyectos}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Inversión Total"
          value={formatCurrency(stats.inversionTotal)}
          icon={DollarSign}
          color="primary"
        />
        <KPICard
          title="Satisfacción Promedio"
          value={`${stats.satisfaccionPromedio}/5`}
          icon={TrendingUp}
          color="success"
        />
        <KPICard
          title="Lecciones Documentadas"
          value={stats.leccionesTotal}
          icon={FileText}
          color="default"
        />
      </div>

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
          value={filterGerencia}
          onChange={(e) => setFilterGerencia(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todas las gerencias</option>
          {gerencias.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los años</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proyecto</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Gerencia</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Duración</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Costo Final</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Variación</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Alcance</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Satisfacción</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProyectos.map((proyecto) => (
              <tr key={proyecto.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-accent">{proyecto.codigo}</span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{proyecto.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cierre: {new Date(proyecto.fechaCierre).toLocaleDateString('es-CL')}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{proyecto.gerencia}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {proyecto.duracionMeses}m
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(proyecto.costoFinal)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-medium ${
                    proyecto.variacionCosto <= 0 ? 'text-green-600' :
                    proyecto.variacionCosto <= 5 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {proyecto.variacionCosto > 0 ? '+' : ''}{proyecto.variacionCosto.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-medium ${
                    proyecto.cumplimientoAlcance >= 100 ? 'text-green-600' :
                    proyecto.cumplimientoAlcance >= 90 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {proyecto.cumplimientoAlcance}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-2 h-2 rounded-full ${
                          star <= proyecto.satisfaccionCliente ? 'bg-amber-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{proyecto.satisfaccionCliente}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                      <FileText className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Gerencia</h3>
          <div className="space-y-3">
            {gerencias.map((gerencia) => {
              const count = proyectosCerrados.filter((p) => p.gerencia === gerencia).length;
              const percentage = (count / proyectosCerrados.length) * 100;
              return (
                <div key={gerencia} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">{gerencia}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lecciones Aprendidas Destacadas</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Buenas Prácticas</p>
              <p className="text-xs text-green-600 mt-1">
                Documentación temprana y gestión proactiva de stakeholders mejora satisfacción
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-800">Áreas de Mejora</p>
              <p className="text-xs text-amber-600 mt-1">
                Estimaciones de migración cloud requieren buffers adicionales del 15-20%
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Recomendación</p>
              <p className="text-xs text-blue-600 mt-1">
                Incluir usuarios finales desde etapas tempranas reduce resistencia al cambio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
