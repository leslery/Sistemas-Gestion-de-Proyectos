import { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  DollarSign,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface Proveedor {
  id: number;
  rut: string;
  nombre: string;
  giro: string;
  contacto: string;
  email: string;
  telefono: string;
  calificacion: number;
  contratosActivos: number;
  montoContratado: number;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  ultimaEvaluacion: string;
  criterios: {
    calidad: number;
    cumplimiento: number;
    precio: number;
    servicio: number;
  };
}

const proveedores: Proveedor[] = [
  { id: 1, rut: '76.XXX.XXX-X', nombre: 'SAP Chile SpA', giro: 'Consultoría TI', contacto: 'Juan Martínez', email: 'jmartinez@sap.com', telefono: '+56 2 2345 6789', calificacion: 4.5, contratosActivos: 3, montoContratado: 450000000, estado: 'activo', ultimaEvaluacion: '2024-01-15', criterios: { calidad: 4.8, cumplimiento: 4.2, precio: 4.0, servicio: 4.5 } },
  { id: 2, rut: '96.XXX.XXX-X', nombre: 'Microsoft Chile', giro: 'Software', contacto: 'María López', email: 'mlopez@microsoft.com', telefono: '+56 2 2345 1234', calificacion: 4.8, contratosActivos: 5, montoContratado: 280000000, estado: 'activo', ultimaEvaluacion: '2024-02-01', criterios: { calidad: 5.0, cumplimiento: 4.8, precio: 4.5, servicio: 4.9 } },
  { id: 3, rut: '77.XXX.XXX-X', nombre: 'Dell Technologies', giro: 'Hardware', contacto: 'Carlos Pérez', email: 'cperez@dell.com', telefono: '+56 2 2345 5678', calificacion: 4.2, contratosActivos: 2, montoContratado: 180000000, estado: 'activo', ultimaEvaluacion: '2024-01-20', criterios: { calidad: 4.5, cumplimiento: 4.0, precio: 4.0, servicio: 4.3 } },
  { id: 4, rut: '78.XXX.XXX-X', nombre: 'Accenture Chile', giro: 'Consultoría', contacto: 'Ana Rodríguez', email: 'arodriguez@accenture.com', telefono: '+56 2 2345 9012', calificacion: 3.8, contratosActivos: 1, montoContratado: 120000000, estado: 'activo', ultimaEvaluacion: '2023-12-10', criterios: { calidad: 4.0, cumplimiento: 3.5, precio: 3.8, servicio: 3.9 } },
];

const estadoColors = {
  activo: 'bg-green-100 text-green-700',
  inactivo: 'bg-gray-100 text-gray-700',
  bloqueado: 'bg-red-100 text-red-700',
};

export default function EvaluacionProveedores() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);

  const filteredProveedores = proveedores.filter((p) => {
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterEstado !== 'all' && p.estado !== filterEstado) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const stats = {
    totalProveedores: proveedores.length,
    activos: proveedores.filter((p) => p.estado === 'activo').length,
    calificacionPromedio: (proveedores.reduce((acc, p) => acc + p.calificacion, 0) / proveedores.length).toFixed(1),
    montoTotal: proveedores.reduce((acc, p) => acc + p.montoContratado, 0),
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-amber-400 fill-amber-400' :
              star <= rating + 0.5 ? 'text-amber-400 fill-amber-400/50' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-accent" />
            Evaluación de Proveedores
          </h1>
          <p className="text-gray-500 mt-1">Gestión y calificación de proveedores</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Proveedores"
          value={stats.totalProveedores}
          icon={Users}
          color="primary"
        />
        <KPICard
          title="Proveedores Activos"
          value={stats.activos}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Calificación Promedio"
          value={`${stats.calificacionPromedio}/5`}
          icon={Star}
          color="warning"
        />
        <KPICard
          title="Monto Contratado"
          value={formatCurrency(stats.montoTotal)}
          icon={DollarSign}
          color="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Providers List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar proveedor..."
                className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>

          {/* Providers Cards */}
          <div className="space-y-4">
            {filteredProveedores.map((proveedor) => (
              <div
                key={proveedor.id}
                onClick={() => setSelectedProveedor(proveedor)}
                className={`bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-accent/50 transition-colors ${
                  selectedProveedor?.id === proveedor.id ? 'border-accent ring-1 ring-accent/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{proveedor.nombre}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${estadoColors[proveedor.estado]}`}>
                        {proveedor.estado}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{proveedor.rut} · {proveedor.giro}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(proveedor.calificacion)}
                    <span className="text-sm font-medium text-gray-700 ml-1">{proveedor.calificacion}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div>
                    <span className="text-gray-500">Contratos Activos</span>
                    <p className="font-medium text-gray-900">{proveedor.contratosActivos}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Monto Contratado</span>
                    <p className="font-medium text-gray-900">{formatCurrency(proveedor.montoContratado)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Última Evaluación</span>
                    <p className="font-medium text-gray-900">
                      {new Date(proveedor.ultimaEvaluacion).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {selectedProveedor ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedProveedor.nombre}</h3>
                <p className="text-sm text-gray-500">{selectedProveedor.giro}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Información de Contacto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contacto</span>
                    <span className="font-medium">{selectedProveedor.contacto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-accent">{selectedProveedor.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Teléfono</span>
                    <span className="font-medium">{selectedProveedor.telefono}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Evaluación por Criterios</h4>
                <div className="space-y-3">
                  {Object.entries(selectedProveedor.criterios).map(([criterio, valor]) => (
                    <div key={criterio}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{criterio}</span>
                        <span className="font-medium">{valor}/5</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            valor >= 4.5 ? 'bg-green-500' :
                            valor >= 4 ? 'bg-blue-500' :
                            valor >= 3.5 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(valor / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                  <Star className="h-4 w-4" />
                  Nueva Evaluación
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <FileText className="h-4 w-4" />
                  Ver Historial
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Users className="h-12 w-12 mb-3" />
              <p className="text-sm">Seleccione un proveedor para ver detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
