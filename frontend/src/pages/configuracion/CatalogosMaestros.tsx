import { useState } from 'react';
import {
  Database,
  Plus,
  Edit,
  Trash2,
  Search,
  Building2,
  FolderTree,
  Flag,
  Layers,
  AlertTriangle,
  Target,
  Users,
  DollarSign,
  Globe,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Types
interface CatalogoItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
  color?: string;
}

interface Catalogo {
  id: string;
  nombre: string;
  descripcion: string;
  icon: any;
  color: string;
  items: CatalogoItem[];
}

// Mock Data
const catalogosData: Catalogo[] = [
  {
    id: 'areas',
    nombre: 'Áreas / Gerencias',
    descripcion: 'Estructura organizacional de la empresa',
    icon: Building2,
    color: 'blue',
    items: [
      { id: 1, codigo: 'PMO', nombre: 'Project Management Office', descripcion: 'Oficina de gestión de proyectos', activo: true, orden: 1 },
      { id: 2, codigo: 'TI', nombre: 'Tecnología de la Información', descripcion: 'Área de sistemas y tecnología', activo: true, orden: 2 },
      { id: 3, codigo: 'FIN', nombre: 'Finanzas', descripcion: 'Área financiera y contable', activo: true, orden: 3 },
      { id: 4, codigo: 'COM', nombre: 'Comercial', descripcion: 'Área comercial y ventas', activo: true, orden: 4 },
      { id: 5, codigo: 'OPE', nombre: 'Operaciones', descripcion: 'Área de operaciones', activo: true, orden: 5 },
      { id: 6, codigo: 'RRHH', nombre: 'Recursos Humanos', descripcion: 'Gestión del talento', activo: true, orden: 6 },
      { id: 7, codigo: 'LEG', nombre: 'Legal', descripcion: 'Área legal y cumplimiento', activo: false, orden: 7 },
    ],
  },
  {
    id: 'tipos_proyecto',
    nombre: 'Tipos de Proyecto',
    descripcion: 'Clasificación financiera de proyectos',
    icon: FolderTree,
    color: 'purple',
    items: [
      { id: 1, codigo: 'CAPEX_T', nombre: 'CAPEX Tangible', descripcion: 'Inversión en activos tangibles', activo: true, color: '#3182ce' },
      { id: 2, codigo: 'CAPEX_I', nombre: 'CAPEX Intangible', descripcion: 'Inversión en activos intangibles', activo: true, color: '#805ad5' },
      { id: 3, codigo: 'OPEX', nombre: 'OPEX', descripcion: 'Gastos operativos', activo: true, color: '#38a169' },
    ],
  },
  {
    id: 'estados_proyecto',
    nombre: 'Estados de Proyecto',
    descripcion: 'Estados del ciclo de vida del proyecto',
    icon: Layers,
    color: 'green',
    items: [
      { id: 1, codigo: 'BANCO', nombre: 'Banco de Reserva', descripcion: 'Proyecto aprobado en espera', activo: true, orden: 1, color: '#d69e2e' },
      { id: 2, codigo: 'PLAN', nombre: 'Plan Anual', descripcion: 'Incluido en el plan anual', activo: true, orden: 2, color: '#3182ce' },
      { id: 3, codigo: 'EJEC', nombre: 'En Ejecución', descripcion: 'Proyecto en desarrollo', activo: true, orden: 3, color: '#38a169' },
      { id: 4, codigo: 'PAUS', nombre: 'Pausado', descripcion: 'Proyecto temporalmente detenido', activo: true, orden: 4, color: '#718096' },
      { id: 5, codigo: 'CANC', nombre: 'Cancelado', descripcion: 'Proyecto cancelado', activo: true, orden: 5, color: '#e53e3e' },
      { id: 6, codigo: 'COMP', nombre: 'Completado', descripcion: 'Proyecto finalizado', activo: true, orden: 6, color: '#805ad5' },
    ],
  },
  {
    id: 'prioridades',
    nombre: 'Prioridades',
    descripcion: 'Niveles de prioridad para proyectos',
    icon: Flag,
    color: 'red',
    items: [
      { id: 1, codigo: 'P1', nombre: 'P1 - Crítica', descripcion: 'Máxima prioridad, impacto crítico', activo: true, orden: 1, color: '#e53e3e' },
      { id: 2, codigo: 'P2', nombre: 'P2 - Alta', descripcion: 'Alta prioridad, impacto significativo', activo: true, orden: 2, color: '#dd6b20' },
      { id: 3, codigo: 'P3', nombre: 'P3 - Media', descripcion: 'Prioridad media, impacto moderado', activo: true, orden: 3, color: '#d69e2e' },
      { id: 4, codigo: 'P4', nombre: 'P4 - Baja', descripcion: 'Baja prioridad, impacto menor', activo: true, orden: 4, color: '#3182ce' },
      { id: 5, codigo: 'P5', nombre: 'P5 - Muy Baja', descripcion: 'Mínima prioridad', activo: true, orden: 5, color: '#718096' },
    ],
  },
  {
    id: 'fases',
    nombre: 'Fases de Proyecto',
    descripcion: 'Etapas del ciclo de implementación',
    icon: Target,
    color: 'cyan',
    items: [
      { id: 1, codigo: 'PLAN', nombre: 'Planificación', descripcion: 'Fase de planificación y kick-off', activo: true, orden: 1 },
      { id: 2, codigo: 'ANAL', nombre: 'Análisis y Diseño', descripcion: 'Levantamiento y diseño de solución', activo: true, orden: 2 },
      { id: 3, codigo: 'CONS', nombre: 'Construcción', descripcion: 'Desarrollo e implementación', activo: true, orden: 3 },
      { id: 4, codigo: 'PRUE', nombre: 'Pruebas', descripcion: 'QA y pruebas de aceptación', activo: true, orden: 4 },
      { id: 5, codigo: 'TRAN', nombre: 'Transición', descripcion: 'Preparación para salida a producción', activo: true, orden: 5 },
      { id: 6, codigo: 'LIVE', nombre: 'Go Live', descripcion: 'Puesta en producción y soporte', activo: true, orden: 6 },
    ],
  },
  {
    id: 'tipos_riesgo',
    nombre: 'Tipos de Riesgo',
    descripcion: 'Categorías de riesgos de proyecto',
    icon: AlertTriangle,
    color: 'orange',
    items: [
      { id: 1, codigo: 'TEC', nombre: 'Técnico', descripcion: 'Riesgos tecnológicos y de infraestructura', activo: true },
      { id: 2, codigo: 'FIN', nombre: 'Financiero', descripcion: 'Riesgos de presupuesto y costos', activo: true },
      { id: 3, codigo: 'OPE', nombre: 'Operacional', descripcion: 'Riesgos de procesos y operaciones', activo: true },
      { id: 4, codigo: 'LEG', nombre: 'Legal/Regulatorio', descripcion: 'Riesgos legales y de cumplimiento', activo: true },
      { id: 5, codigo: 'REC', nombre: 'Recursos', descripcion: 'Riesgos de disponibilidad de recursos', activo: true },
      { id: 6, codigo: 'EXT', nombre: 'Externo', descripcion: 'Riesgos externos y de mercado', activo: true },
    ],
  },
  {
    id: 'proveedores',
    nombre: 'Proveedores',
    descripcion: 'Catálogo de proveedores homologados',
    icon: Users,
    color: 'indigo',
    items: [
      { id: 1, codigo: 'SAP', nombre: 'SAP Chile', descripcion: 'ERP y soluciones empresariales', activo: true },
      { id: 2, codigo: 'MSFT', nombre: 'Microsoft', descripcion: 'Software y servicios cloud', activo: true },
      { id: 3, codigo: 'ACN', nombre: 'Accenture', descripcion: 'Consultoría y servicios TI', activo: true },
      { id: 4, codigo: 'IBM', nombre: 'IBM Chile', descripcion: 'Infraestructura y servicios', activo: true },
      { id: 5, codigo: 'DXC', nombre: 'DXC Technology', descripcion: 'Servicios de TI', activo: false },
    ],
  },
  {
    id: 'categorias_gasto',
    nombre: 'Categorías de Gasto',
    descripcion: 'Clasificación de gastos de proyecto',
    icon: DollarSign,
    color: 'emerald',
    items: [
      { id: 1, codigo: 'LIC', nombre: 'Licencias', descripcion: 'Licencias de software', activo: true },
      { id: 2, codigo: 'SER', nombre: 'Servicios', descripcion: 'Servicios profesionales', activo: true },
      { id: 3, codigo: 'HW', nombre: 'Hardware', descripcion: 'Equipamiento y hardware', activo: true },
      { id: 4, codigo: 'INF', nombre: 'Infraestructura', descripcion: 'Infraestructura y hosting', activo: true },
      { id: 5, codigo: 'CAP', nombre: 'Capacitación', descripcion: 'Formación y capacitación', activo: true },
      { id: 6, codigo: 'OTR', nombre: 'Otros', descripcion: 'Otros gastos', activo: true },
    ],
  },
  {
    id: 'monedas',
    nombre: 'Monedas',
    descripcion: 'Monedas para presupuestos',
    icon: Globe,
    color: 'teal',
    items: [
      { id: 1, codigo: 'CLP', nombre: 'Peso Chileno', descripcion: 'Moneda local', activo: true },
      { id: 2, codigo: 'USD', nombre: 'Dólar Estadounidense', descripcion: 'Moneda internacional', activo: true },
      { id: 3, codigo: 'EUR', nombre: 'Euro', descripcion: 'Moneda europea', activo: true },
      { id: 4, codigo: 'UF', nombre: 'Unidad de Fomento', descripcion: 'Unidad reajustable', activo: true },
    ],
  },
];

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  orange: 'bg-orange-100 text-orange-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  teal: 'bg-teal-100 text-teal-600',
};

export default function CatalogosMaestros() {
  const [selectedCatalogo, setSelectedCatalogo] = useState<Catalogo | null>(catalogosData[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);

  const filteredItems = selectedCatalogo?.items.filter(
    (item) =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const stats = {
    totalCatalogos: catalogosData.length,
    totalItems: catalogosData.reduce((acc, c) => acc + c.items.length, 0),
    itemsActivos: catalogosData.reduce((acc, c) => acc + c.items.filter(i => i.activo).length, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-7 w-7 text-accent" />
            Catálogos Maestros
          </h1>
          <p className="text-gray-500 mt-1">Gestión de datos maestros del sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCatalogos}</p>
              <p className="text-sm text-gray-500">Catálogos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-gray-500">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.itemsActivos}</p>
              <p className="text-sm text-gray-500">Items Activos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Catalog List */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Seleccionar Catálogo</h3>
          {catalogosData.map((catalogo) => {
            const Icon = catalogo.icon;
            const isSelected = selectedCatalogo?.id === catalogo.id;

            return (
              <button
                key={catalogo.id}
                onClick={() => {
                  setSelectedCatalogo(catalogo);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-accent text-white'
                    : 'bg-white border border-gray-200 hover:border-accent/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : colorClasses[catalogo.color]}`}>
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {catalogo.nombre}
                  </p>
                  <p className={`text-xs truncate ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                    {catalogo.items.length} items
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Catalog Items */}
        <div className="lg:col-span-3">
          {selectedCatalogo && (
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedCatalogo.nombre}</h3>
                    <p className="text-sm text-gray-500">{selectedCatalogo.descripcion}</p>
                  </div>
                  <button
                    onClick={() => setShowNewItemModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo Item
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar en catálogo..."
                    className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {item.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900">{item.codigo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{item.nombre}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-500">{item.descripcion || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.activo ? (
                              <><CheckCircle className="h-3 w-3" /> Activo</>
                            ) : (
                              <><XCircle className="h-3 w-3" /> Inactivo</>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No se encontraron items</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Item */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuevo Item - {selectedCatalogo?.nombre}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="Ej: COD01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="Nombre del item"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo" defaultChecked className="rounded" />
                <label htmlFor="activo" className="text-sm text-gray-700">Activo</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewItemModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowNewItemModal(false)}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
