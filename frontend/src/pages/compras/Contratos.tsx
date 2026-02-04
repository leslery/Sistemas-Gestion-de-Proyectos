import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface Contrato {
  id: number;
  codigo: string;
  proveedor: string;
  proyecto: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  montoTotal: number;
  montoEjecutado: number;
  estado: 'vigente' | 'por_vencer' | 'vencido' | 'cerrado';
  tipoContrato: 'marco' | 'especifico' | 'adendum';
  diasRestantes: number;
}

const contratos: Contrato[] = [
  { id: 1, codigo: 'CTR-001', proveedor: 'SAP Chile SpA', proyecto: 'Modernización ERP', descripcion: 'Contrato Marco Licenciamiento SAP S/4HANA', fechaInicio: '2023-01-15', fechaFin: '2025-01-15', montoTotal: 450000000, montoEjecutado: 320000000, estado: 'vigente', tipoContrato: 'marco', diasRestantes: 345 },
  { id: 2, codigo: 'CTR-002', proveedor: 'Microsoft Chile', proyecto: 'General', descripcion: 'Enterprise Agreement Microsoft 365', fechaInicio: '2023-06-01', fechaFin: '2024-05-31', montoTotal: 180000000, montoEjecutado: 150000000, estado: 'por_vencer', tipoContrato: 'marco', diasRestantes: 45 },
  { id: 3, codigo: 'CTR-003', proveedor: 'Dell Technologies', proyecto: 'Migración Cloud', descripcion: 'Adquisición Servidores PowerEdge', fechaInicio: '2024-01-01', fechaFin: '2024-12-31', montoTotal: 85000000, montoEjecutado: 0, estado: 'vigente', tipoContrato: 'especifico', diasRestantes: 330 },
  { id: 4, codigo: 'CTR-004', proveedor: 'Accenture Chile', proyecto: 'Portal Autoatención', descripcion: 'Consultoría UX/UI Portal', fechaInicio: '2023-09-01', fechaFin: '2024-02-28', montoTotal: 120000000, montoEjecutado: 110000000, estado: 'por_vencer', tipoContrato: 'especifico', diasRestantes: 15 },
];

const estadoColors = {
  vigente: 'bg-green-100 text-green-700',
  por_vencer: 'bg-amber-100 text-amber-700',
  vencido: 'bg-red-100 text-red-700',
  cerrado: 'bg-gray-100 text-gray-700',
};

const estadoLabels = {
  vigente: 'Vigente',
  por_vencer: 'Por Vencer',
  vencido: 'Vencido',
  cerrado: 'Cerrado',
};

const tipoLabels = {
  marco: 'Marco',
  especifico: 'Específico',
  adendum: 'Adendum',
};

export default function Contratos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');

  const filteredContratos = contratos.filter((c) => {
    if (searchQuery && !c.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) && !c.proveedor.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterEstado !== 'all' && c.estado !== filterEstado) return false;
    if (filterTipo !== 'all' && c.tipoContrato !== filterTipo) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const stats = {
    totalContratos: contratos.length,
    vigentes: contratos.filter((c) => c.estado === 'vigente').length,
    porVencer: contratos.filter((c) => c.estado === 'por_vencer').length,
    montoTotal: contratos.reduce((acc, c) => acc + c.montoTotal, 0),
    montoEjecutado: contratos.reduce((acc, c) => acc + c.montoEjecutado, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-accent" />
            Gestión de Contratos
          </h1>
          <p className="text-gray-500 mt-1">Administración de contratos con proveedores</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo Contrato
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard
          title="Total Contratos"
          value={stats.totalContratos}
          icon={FileText}
          color="primary"
        />
        <KPICard
          title="Vigentes"
          value={stats.vigentes}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Por Vencer"
          value={stats.porVencer}
          icon={AlertTriangle}
          color="warning"
        />
        <KPICard
          title="Monto Total"
          value={formatCurrency(stats.montoTotal)}
          icon={DollarSign}
          color="default"
        />
        <KPICard
          title="Ejecutado"
          value={formatCurrency(stats.montoEjecutado)}
          icon={DollarSign}
          color="primary"
          subtitle={`${Math.round((stats.montoEjecutado / stats.montoTotal) * 100)}%`}
        />
      </div>

      {/* Alert for expiring contracts */}
      {stats.porVencer > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {stats.porVencer} contrato{stats.porVencer > 1 ? 's' : ''} próximo{stats.porVencer > 1 ? 's' : ''} a vencer
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Revise y gestione la renovación de los contratos con vencimiento próximo</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar contrato o proveedor..."
            className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los estados</option>
          <option value="vigente">Vigente</option>
          <option value="por_vencer">Por Vencer</option>
          <option value="vencido">Vencido</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los tipos</option>
          <option value="marco">Marco</option>
          <option value="especifico">Específico</option>
          <option value="adendum">Adendum</option>
        </select>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Contrato</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proveedor</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Tipo</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Vigencia</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Monto</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Ejecución</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredContratos.map((contrato) => {
              const porcentajeEjecucion = Math.round((contrato.montoEjecutado / contrato.montoTotal) * 100);

              return (
                <tr key={contrato.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-accent">{contrato.codigo}</span>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1">{contrato.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{contrato.proyecto}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{contrato.proveedor}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      {tipoLabels[contrato.tipoContrato]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-xs text-gray-600">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(contrato.fechaInicio).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })} -
                        {new Date(contrato.fechaFin).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })}
                      </div>
                      {contrato.estado !== 'cerrado' && contrato.estado !== 'vencido' && (
                        <p className={`mt-0.5 font-medium ${contrato.diasRestantes <= 30 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {contrato.diasRestantes} días
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(contrato.montoTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${porcentajeEjecucion}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{porcentajeEjecucion}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${estadoColors[contrato.estado]}`}>
                      {estadoLabels[contrato.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
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
