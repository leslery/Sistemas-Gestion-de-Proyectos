import { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Shield,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface Riesgo {
  id: number;
  codigo: string;
  descripcion: string;
  proyecto: string;
  probabilidad: 'alta' | 'media' | 'baja';
  impacto: 'alto' | 'medio' | 'bajo';
  estado: 'abierto' | 'mitigado' | 'materializado' | 'cerrado';
  responsable: string;
  mitigacion: string;
  fechaIdentificacion: string;
}

const riesgos: Riesgo[] = [
  { id: 1, codigo: 'RSK-001', descripcion: 'Retraso en entrega de proveedor SAP', proyecto: 'Modernización ERP', probabilidad: 'alta', impacto: 'alto', estado: 'abierto', responsable: 'Carlos López', mitigacion: 'Negociar entregas parciales y penalizaciones contractuales', fechaIdentificacion: '2024-01-15' },
  { id: 2, codigo: 'RSK-002', descripcion: 'Resistencia al cambio de usuarios', proyecto: 'Portal Autoatención', probabilidad: 'media', impacto: 'medio', estado: 'mitigado', responsable: 'María García', mitigacion: 'Plan de gestión del cambio y capacitaciones', fechaIdentificacion: '2024-01-20' },
  { id: 3, codigo: 'RSK-003', descripcion: 'Incompatibilidad con sistemas legados', proyecto: 'Sistema CRM', probabilidad: 'media', impacto: 'alto', estado: 'abierto', responsable: 'Juan Pérez', mitigacion: 'POC de integración antes del desarrollo completo', fechaIdentificacion: '2024-02-01' },
  { id: 4, codigo: 'RSK-004', descripcion: 'Rotación de personal clave', proyecto: 'Modernización ERP', probabilidad: 'baja', impacto: 'alto', estado: 'abierto', responsable: 'Equipo', mitigacion: 'Documentación detallada y plan de backup', fechaIdentificacion: '2024-02-05' },
];

const probabilidadColors = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-green-100 text-green-700',
};

const impactoColors = {
  alto: 'bg-red-100 text-red-700',
  medio: 'bg-amber-100 text-amber-700',
  bajo: 'bg-green-100 text-green-700',
};

const estadoColors = {
  abierto: 'bg-blue-100 text-blue-700',
  mitigado: 'bg-green-100 text-green-700',
  materializado: 'bg-red-100 text-red-700',
  cerrado: 'bg-gray-100 text-gray-700',
};

export default function GestionRiesgos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProyecto, setFilterProyecto] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  const proyectos = [...new Set(riesgos.map((r) => r.proyecto))];

  const filteredRiesgos = riesgos.filter((r) => {
    if (searchQuery && !r.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterProyecto !== 'all' && r.proyecto !== filterProyecto) return false;
    if (filterEstado !== 'all' && r.estado !== filterEstado) return false;
    return true;
  });

  const stats = {
    total: riesgos.length,
    abiertos: riesgos.filter((r) => r.estado === 'abierto').length,
    mitigados: riesgos.filter((r) => r.estado === 'mitigado').length,
    criticos: riesgos.filter((r) => r.probabilidad === 'alta' && r.impacto === 'alto').length,
  };

  // Calculate risk score for matrix
  const getRiskScore = (probabilidad: string, impacto: string) => {
    const probScore = probabilidad === 'alta' ? 3 : probabilidad === 'media' ? 2 : 1;
    const impScore = impacto === 'alto' ? 3 : impacto === 'medio' ? 2 : 1;
    return probScore * impScore;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-accent" />
            Gestión de Riesgos
          </h1>
          <p className="text-gray-500 mt-1">Identificación y mitigación de riesgos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo Riesgo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Riesgos"
          value={stats.total}
          icon={AlertTriangle}
          color="primary"
        />
        <KPICard
          title="Riesgos Abiertos"
          value={stats.abiertos}
          icon={Clock}
          color="warning"
        />
        <KPICard
          title="Mitigados"
          value={stats.mitigados}
          icon={Shield}
          color="success"
        />
        <KPICard
          title="Críticos"
          value={stats.criticos}
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Matrix */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Matriz de Riesgos</h3>
          <div className="aspect-square relative">
            {/* Grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1">
              {[
                { prob: 'alta', imp: 'bajo', color: 'bg-amber-100' },
                { prob: 'alta', imp: 'medio', color: 'bg-red-200' },
                { prob: 'alta', imp: 'alto', color: 'bg-red-400' },
                { prob: 'media', imp: 'bajo', color: 'bg-green-100' },
                { prob: 'media', imp: 'medio', color: 'bg-amber-100' },
                { prob: 'media', imp: 'alto', color: 'bg-red-200' },
                { prob: 'baja', imp: 'bajo', color: 'bg-green-100' },
                { prob: 'baja', imp: 'medio', color: 'bg-green-100' },
                { prob: 'baja', imp: 'alto', color: 'bg-amber-100' },
              ].map((cell, i) => {
                const count = riesgos.filter(
                  (r) => r.probabilidad === cell.prob && r.impacto === cell.imp && r.estado === 'abierto'
                ).length;
                return (
                  <div key={i} className={`${cell.color} rounded flex items-center justify-center`}>
                    {count > 0 && (
                      <span className="text-lg font-bold text-gray-700">{count}</span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Labels */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-gray-500 uppercase">
              Probabilidad →
            </div>
            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 uppercase">
              Impacto →
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded" />
              <span>Bajo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-100 rounded" />
              <span>Medio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-200 rounded" />
              <span>Alto</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded" />
              <span>Crítico</span>
            </div>
          </div>
        </div>

        {/* Risk List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-200">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar riesgo..."
                className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
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
              <option value="abierto">Abierto</option>
              <option value="mitigado">Mitigado</option>
              <option value="materializado">Materializado</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Riesgo</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Prob.</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Imp.</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRiesgos.map((riesgo) => (
                  <tr key={riesgo.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-accent">{riesgo.codigo}</span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1">{riesgo.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{riesgo.proyecto}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${probabilidadColors[riesgo.probabilidad]}`}>
                        {riesgo.probabilidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${impactoColors[riesgo.impacto]}`}>
                        {riesgo.impacto}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${estadoColors[riesgo.estado]}`}>
                        {riesgo.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
