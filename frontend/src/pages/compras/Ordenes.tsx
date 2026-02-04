import { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  FileText,
  DollarSign,
  Download,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface OrdenCompra {
  id: number;
  numero: string;
  contrato: string;
  proveedor: string;
  proyecto: string;
  descripcion: string;
  fechaEmision: string;
  fechaEntrega: string;
  monto: number;
  estado: 'emitida' | 'en_transito' | 'recibida' | 'facturada' | 'pagada';
}

const ordenes: OrdenCompra[] = [
  { id: 1, numero: 'OC-2024-001', contrato: 'CTR-001', proveedor: 'SAP Chile SpA', proyecto: 'Modernización ERP', descripcion: 'Licencias SAP S/4HANA - Fase 1', fechaEmision: '2024-02-01', fechaEntrega: '2024-02-15', monto: 85000000, estado: 'recibida' },
  { id: 2, numero: 'OC-2024-002', contrato: 'CTR-002', proveedor: 'Microsoft Chile', proyecto: 'General', descripcion: 'Renovación Licencias M365 Q1', fechaEmision: '2024-02-05', fechaEntrega: '2024-02-10', monto: 45000000, estado: 'pagada' },
  { id: 3, numero: 'OC-2024-003', contrato: 'CTR-003', proveedor: 'Dell Technologies', proyecto: 'Migración Cloud', descripcion: 'Servidores PowerEdge R750', fechaEmision: '2024-02-08', fechaEntrega: '2024-03-01', monto: 65000000, estado: 'en_transito' },
  { id: 4, numero: 'OC-2024-004', contrato: 'CTR-004', proveedor: 'Accenture Chile', proyecto: 'Portal Autoatención', descripcion: 'Consultoría UX Febrero', fechaEmision: '2024-02-10', fechaEntrega: '2024-02-28', monto: 25000000, estado: 'emitida' },
  { id: 5, numero: 'OC-2024-005', contrato: 'CTR-001', proveedor: 'SAP Chile SpA', proyecto: 'Modernización ERP', descripcion: 'Consultoría Implementación - Sprint 3', fechaEmision: '2024-02-12', fechaEntrega: '2024-03-15', monto: 35000000, estado: 'facturada' },
];

const estadoColors = {
  emitida: 'bg-blue-100 text-blue-700',
  en_transito: 'bg-purple-100 text-purple-700',
  recibida: 'bg-green-100 text-green-700',
  facturada: 'bg-amber-100 text-amber-700',
  pagada: 'bg-gray-100 text-gray-700',
};

const estadoLabels = {
  emitida: 'Emitida',
  en_transito: 'En Tránsito',
  recibida: 'Recibida',
  facturada: 'Facturada',
  pagada: 'Pagada',
};

const estadoIcons = {
  emitida: FileText,
  en_transito: Truck,
  recibida: CheckCircle,
  facturada: FileText,
  pagada: DollarSign,
};

export default function Ordenes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterProveedor, setFilterProveedor] = useState<string>('all');

  const proveedores = [...new Set(ordenes.map((o) => o.proveedor))];

  const filteredOrdenes = ordenes.filter((o) => {
    if (searchQuery && !o.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) && !o.numero.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterEstado !== 'all' && o.estado !== filterEstado) return false;
    if (filterProveedor !== 'all' && o.proveedor !== filterProveedor) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const stats = {
    totalOrdenes: ordenes.length,
    emitidas: ordenes.filter((o) => o.estado === 'emitida').length,
    enTransito: ordenes.filter((o) => o.estado === 'en_transito').length,
    montoTotal: ordenes.reduce((acc, o) => acc + o.monto, 0),
    montoPendiente: ordenes.filter((o) => o.estado !== 'pagada').reduce((acc, o) => acc + o.monto, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-accent" />
            Órdenes de Compra
          </h1>
          <p className="text-gray-500 mt-1">Seguimiento de órdenes de compra</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            <Plus className="h-4 w-4" />
            Nueva Orden
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard
          title="Total Órdenes"
          value={stats.totalOrdenes}
          icon={ShoppingCart}
          color="primary"
        />
        <KPICard
          title="Emitidas"
          value={stats.emitidas}
          icon={FileText}
          color="default"
        />
        <KPICard
          title="En Tránsito"
          value={stats.enTransito}
          icon={Truck}
          color="warning"
        />
        <KPICard
          title="Monto Total"
          value={formatCurrency(stats.montoTotal)}
          icon={DollarSign}
          color="default"
        />
        <KPICard
          title="Pendiente de Pago"
          value={formatCurrency(stats.montoPendiente)}
          icon={Clock}
          color="warning"
        />
      </div>

      {/* Pipeline Visual */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Pipeline de Órdenes</h3>
        <div className="flex items-center justify-between">
          {Object.entries(estadoLabels).map(([estado, label], index) => {
            const count = ordenes.filter((o) => o.estado === estado).length;
            const Icon = estadoIcons[estado as keyof typeof estadoIcons];

            return (
              <div key={estado} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    count > 0 ? 'bg-accent text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-2">{label}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                {index < Object.keys(estadoLabels).length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar orden..."
            className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(estadoLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filterProveedor}
          onChange={(e) => setFilterProveedor(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los proveedores</option>
          {proveedores.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Orden</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proveedor</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proyecto</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Emisión</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Entrega</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Monto</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrdenes.map((orden) => {
              const Icon = estadoIcons[orden.estado];

              return (
                <tr key={orden.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-accent">{orden.numero}</span>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1">{orden.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{orden.contrato}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{orden.proveedor}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{orden.proyecto}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {new Date(orden.fechaEmision).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {new Date(orden.fechaEntrega).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(orden.monto)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${estadoColors[orden.estado]}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {estadoLabels[orden.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      {orden.estado === 'en_transito' && (
                        <button className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition-colors">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
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
