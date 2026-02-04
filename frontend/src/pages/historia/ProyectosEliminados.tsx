import { useState } from 'react';
import {
  Trash2,
  Search,
  Download,
  Eye,
  Calendar,
  AlertTriangle,
  FileText,
  RotateCcw,
  Clock,
  TrendingDown,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface ProyectoEliminado {
  id: number;
  codigo: string;
  nombre: string;
  gerencia: string;
  solicitante: string;
  fechaIngreso: string;
  fechaEliminacion: string;
  diasEnBanco: number;
  motivoEliminacion: string;
  categoriaEliminacion: 'caducidad' | 'obsoleto' | 'duplicado' | 'descartado' | 'fusionado';
  presupuestoEstimado: number;
  prioridadOriginal: 'alta' | 'media' | 'baja';
}

const proyectosEliminados: ProyectoEliminado[] = [
  { id: 1, codigo: 'BNK-089', nombre: 'Sistema de Reservas Antiguo', gerencia: 'Comercial', solicitante: 'Juan Pérez', fechaIngreso: '2023-01-15', fechaEliminacion: '2024-07-15', diasEnBanco: 547, motivoEliminacion: 'Superado plazo máximo de 18 meses en banco de reserva sin activación', categoriaEliminacion: 'caducidad', presupuestoEstimado: 180000000, prioridadOriginal: 'media' },
  { id: 2, codigo: 'BNK-092', nombre: 'Migración Legacy Oracle', gerencia: 'TI', solicitante: 'María López', fechaIngreso: '2023-02-01', fechaEliminacion: '2024-08-01', diasEnBanco: 547, motivoEliminacion: 'Tecnología Oracle descontinuada. Nueva estrategia cloud-native adoptada', categoriaEliminacion: 'obsoleto', presupuestoEstimado: 520000000, prioridadOriginal: 'alta' },
  { id: 3, codigo: 'BNK-095', nombre: 'App Móvil Clientes v1', gerencia: 'Comercial', solicitante: 'Carlos Rodríguez', fechaIngreso: '2023-03-10', fechaEliminacion: '2024-06-10', diasEnBanco: 457, motivoEliminacion: 'Funcionalidad incluida en proyecto PRY-045 Portal Unificado', categoriaEliminacion: 'fusionado', presupuestoEstimado: 250000000, prioridadOriginal: 'alta' },
  { id: 4, codigo: 'BNK-098', nombre: 'Sistema de Bonificaciones', gerencia: 'RRHH', solicitante: 'Ana Martínez', fechaIngreso: '2023-04-01', fechaEliminacion: '2024-08-15', diasEnBanco: 502, motivoEliminacion: 'Nuevo ERP de RRHH incluye módulo de compensaciones. Iniciativa redundante', categoriaEliminacion: 'duplicado', presupuestoEstimado: 95000000, prioridadOriginal: 'baja' },
  { id: 5, codigo: 'BNK-101', nombre: 'Chatbot WhatsApp', gerencia: 'Servicio al Cliente', solicitante: 'Pedro González', fechaIngreso: '2023-05-15', fechaEliminacion: '2024-05-15', diasEnBanco: 366, motivoEliminacion: 'Evaluación negativa por comité. ROI insuficiente para inversión requerida', categoriaEliminacion: 'descartado', presupuestoEstimado: 120000000, prioridadOriginal: 'media' },
  { id: 6, codigo: 'BNK-104', nombre: 'Dashboard Gerencial v2', gerencia: 'Finanzas', solicitante: 'Roberto Silva', fechaIngreso: '2023-06-01', fechaEliminacion: '2024-09-01', diasEnBanco: 458, motivoEliminacion: 'Superado plazo máximo sin sponsor confirmado', categoriaEliminacion: 'caducidad', presupuestoEstimado: 85000000, prioridadOriginal: 'baja' },
  { id: 7, codigo: 'BNK-107', nombre: 'Portal Proveedores Externo', gerencia: 'Compras', solicitante: 'Laura Díaz', fechaIngreso: '2023-07-10', fechaEliminacion: '2024-07-10', diasEnBanco: 366, motivoEliminacion: 'Proveedor externo ofrece solución SaaS más económica', categoriaEliminacion: 'descartado', presupuestoEstimado: 340000000, prioridadOriginal: 'alta' },
  { id: 8, codigo: 'BNK-110', nombre: 'Sistema IoT Inventarios', gerencia: 'Operaciones', solicitante: 'Miguel Torres', fechaIngreso: '2023-08-01', fechaEliminacion: '2024-08-01', diasEnBanco: 366, motivoEliminacion: 'Tecnología RFID seleccionada en lugar de IoT. Nuevo proyecto creado', categoriaEliminacion: 'obsoleto', presupuestoEstimado: 480000000, prioridadOriginal: 'media' },
];

const categoriaLabels = {
  caducidad: 'Caducidad',
  obsoleto: 'Obsoleto',
  duplicado: 'Duplicado',
  descartado: 'Descartado',
  fusionado: 'Fusionado',
};

const categoriaColors = {
  caducidad: 'bg-gray-100 text-gray-700',
  obsoleto: 'bg-amber-100 text-amber-700',
  duplicado: 'bg-blue-100 text-blue-700',
  descartado: 'bg-red-100 text-red-700',
  fusionado: 'bg-purple-100 text-purple-700',
};

const prioridadColors = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-green-100 text-green-700',
};

export default function ProyectosEliminados() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoEliminado | null>(null);

  const categorias = [...new Set(proyectosEliminados.map((p) => p.categoriaEliminacion))];

  const filteredProyectos = proyectosEliminados.filter((p) => {
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategoria !== 'all' && p.categoriaEliminacion !== filterCategoria) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const stats = {
    totalEliminados: proyectosEliminados.length,
    presupuestoNoEjecutado: proyectosEliminados.reduce((acc, p) => acc + p.presupuestoEstimado, 0),
    porCaducidad: proyectosEliminados.filter((p) => p.categoriaEliminacion === 'caducidad').length,
    diasPromedioEnBanco: Math.round(proyectosEliminados.reduce((acc, p) => acc + p.diasEnBanco, 0) / proyectosEliminados.length),
  };

  const distribucionCategorias = Object.entries(categoriaLabels).map(([key, label]) => ({
    categoria: key,
    label,
    count: proyectosEliminados.filter((p) => p.categoriaEliminacion === key).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 className="h-7 w-7 text-accent" />
            Eliminados del Banco
          </h1>
          <p className="text-gray-500 mt-1">Iniciativas removidas del banco de reserva</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Exportar Histórico
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Eliminados"
          value={stats.totalEliminados}
          icon={Trash2}
          color="default"
        />
        <KPICard
          title="Presupuesto No Ejecutado"
          value={formatCurrency(stats.presupuestoNoEjecutado)}
          icon={TrendingDown}
          color="danger"
          subtitle="Inversión evitada/diferida"
        />
        <KPICard
          title="Por Caducidad"
          value={stats.porCaducidad}
          icon={Clock}
          color="warning"
        />
        <KPICard
          title="Días Promedio en Banco"
          value={stats.diasPromedioEnBanco}
          icon={Calendar}
          color="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Motivo</h3>
          <div className="space-y-4">
            {distribucionCategorias.map((cat) => {
              const percentage = (cat.count / proyectosEliminados.length) * 100;
              return (
                <div key={cat.categoria}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.label}</span>
                    <span className="font-medium">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Análisis</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <p>• Alto porcentaje de caducidad sugiere mejorar priorización</p>
              <p>• Iniciativas fusionadas indican buena consolidación de demanda</p>
              <p>• Revisar proceso de filtro inicial para reducir obsolescencia</p>
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
                placeholder="Buscar iniciativa..."
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
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Iniciativa</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Prioridad</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Días</th>
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
                      <span className="text-xs font-medium text-gray-400">{proyecto.codigo}</span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{proyecto.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{proyecto.gerencia} · {proyecto.solicitante}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${prioridadColors[proyecto.prioridadOriginal]}`}>
                        {proyecto.prioridadOriginal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{proyecto.diasEnBanco}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoriaColors[proyecto.categoriaEliminacion]}`}>
                        {categoriaLabels[proyecto.categoriaEliminacion]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(proyecto.presupuestoEstimado)}
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

      {/* Detail Panel */}
      {selectedProyecto && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-medium text-gray-400">{selectedProyecto.codigo}</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">{selectedProyecto.nombre}</h3>
            </div>
            <button
              onClick={() => setSelectedProyecto(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Información Original</h4>
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
                    <span className="text-gray-500">Fecha de Ingreso</span>
                    <span className="font-medium">{new Date(selectedProyecto.fechaIngreso).toLocaleDateString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha de Eliminación</span>
                    <span className="font-medium">{new Date(selectedProyecto.fechaEliminacion).toLocaleDateString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Presupuesto Estimado</span>
                    <span className="font-medium">{formatCurrency(selectedProyecto.presupuestoEstimado)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prioridad Original</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${prioridadColors[selectedProyecto.prioridadOriginal]}`}>
                      {selectedProyecto.prioridadOriginal}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Motivo de Eliminación</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoriaColors[selectedProyecto.categoriaEliminacion]}`}>
                      {categoriaLabels[selectedProyecto.categoriaEliminacion]}
                    </span>
                    <span className="text-sm text-gray-500">· {selectedProyecto.diasEnBanco} días en banco</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedProyecto.motivoEliminacion}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-accent bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors text-sm">
              <RotateCcw className="h-4 w-4" />
              Reingresar como Nueva Iniciativa
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <FileText className="h-4 w-4" />
              Ver Documentación Archivada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
