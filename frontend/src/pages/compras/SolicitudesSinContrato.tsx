import { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface SolicitudCompra {
  id: number;
  codigo: string;
  descripcion: string;
  proyecto: string;
  solicitante: string;
  fechaSolicitud: string;
  montoEstimado: number;
  estado: 'pendiente' | 'en_evaluacion' | 'aprobada' | 'rechazada';
  prioridad: 'alta' | 'media' | 'baja';
  tipoCompra: 'servicio' | 'licencia' | 'hardware' | 'consultoria';
}

const solicitudes: SolicitudCompra[] = [
  { id: 1, codigo: 'SOL-001', descripcion: 'Licencias Microsoft 365 Enterprise', proyecto: 'Modernización ERP', solicitante: 'Carlos López', fechaSolicitud: '2024-02-08', montoEstimado: 45000000, estado: 'pendiente', prioridad: 'alta', tipoCompra: 'licencia' },
  { id: 2, codigo: 'SOL-002', descripcion: 'Consultoría SAP - Módulo FI', proyecto: 'Modernización ERP', solicitante: 'Juan Pérez', fechaSolicitud: '2024-02-05', montoEstimado: 120000000, estado: 'en_evaluacion', prioridad: 'alta', tipoCompra: 'consultoria' },
  { id: 3, codigo: 'SOL-003', descripcion: 'Servidores Dell PowerEdge', proyecto: 'Migración Cloud', solicitante: 'María García', fechaSolicitud: '2024-02-01', montoEstimado: 85000000, estado: 'aprobada', prioridad: 'media', tipoCompra: 'hardware' },
  { id: 4, codigo: 'SOL-004', descripcion: 'Servicio de Ciberseguridad', proyecto: 'Portal Autoatención', solicitante: 'Ana Rodríguez', fechaSolicitud: '2024-01-28', montoEstimado: 35000000, estado: 'pendiente', prioridad: 'media', tipoCompra: 'servicio' },
];

const estadoColors = {
  pendiente: 'bg-amber-100 text-amber-700',
  en_evaluacion: 'bg-blue-100 text-blue-700',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
};

const estadoLabels = {
  pendiente: 'Pendiente',
  en_evaluacion: 'En Evaluación',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

const prioridadColors = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-green-100 text-green-700',
};

const tipoLabels = {
  servicio: 'Servicio',
  licencia: 'Licencia',
  hardware: 'Hardware',
  consultoria: 'Consultoría',
};

export default function SolicitudesSinContrato() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');

  const filteredSolicitudes = solicitudes.filter((s) => {
    if (searchQuery && !s.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterEstado !== 'all' && s.estado !== filterEstado) return false;
    if (filterTipo !== 'all' && s.tipoCompra !== filterTipo) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter((s) => s.estado === 'pendiente').length,
    enEvaluacion: solicitudes.filter((s) => s.estado === 'en_evaluacion').length,
    montoTotal: solicitudes.reduce((acc, s) => acc + s.montoEstimado, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileQuestion className="h-7 w-7 text-accent" />
            Solicitudes Sin Contrato
          </h1>
          <p className="text-gray-500 mt-1">Gestión de requerimientos de compra pendientes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nueva Solicitud
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Solicitudes"
          value={stats.total}
          icon={FileQuestion}
          color="primary"
        />
        <KPICard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          color="warning"
        />
        <KPICard
          title="En Evaluación"
          value={stats.enEvaluacion}
          icon={AlertCircle}
          color="primary"
        />
        <KPICard
          title="Monto Estimado Total"
          value={formatCurrency(stats.montoTotal)}
          icon={DollarSign}
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
            placeholder="Buscar solicitud..."
            className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_evaluacion">En Evaluación</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los tipos</option>
          <option value="servicio">Servicio</option>
          <option value="licencia">Licencia</option>
          <option value="hardware">Hardware</option>
          <option value="consultoria">Consultoría</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Solicitud</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proyecto</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Tipo</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Prioridad</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Monto Est.</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSolicitudes.map((solicitud) => (
              <tr key={solicitud.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-accent">{solicitud.codigo}</span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1">{solicitud.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{solicitud.solicitante} · {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-CL')}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{solicitud.proyecto}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                    {tipoLabels[solicitud.tipoCompra]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${prioridadColors[solicitud.prioridad]}`}>
                    {solicitud.prioridad}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(solicitud.montoEstimado)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${estadoColors[solicitud.estado]}`}>
                    {estadoLabels[solicitud.estado]}
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
                    {solicitud.estado === 'pendiente' && (
                      <button className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition-colors">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
