import { useState } from 'react';
import {
  FileCode,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface Plantilla {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: 'proyecto' | 'informe' | 'presentacion' | 'formulario' | 'contrato';
  formato: 'docx' | 'xlsx' | 'pptx' | 'pdf';
  version: string;
  descargas: number;
  ultimaActualizacion: string;
  autor: string;
}

const plantillas: Plantilla[] = [
  { id: 1, nombre: 'Acta de Proyecto', descripcion: 'Plantilla para el acta de constitución de proyectos', categoria: 'proyecto', formato: 'docx', version: '2.1', descargas: 156, ultimaActualizacion: '2024-01-15', autor: 'PMO' },
  { id: 2, nombre: 'Informe de Factibilidad', descripcion: 'Plantilla para informes de factibilidad técnica y financiera', categoria: 'informe', formato: 'docx', version: '1.3', descargas: 89, ultimaActualizacion: '2024-02-01', autor: 'PMO' },
  { id: 3, nombre: 'Cronograma de Proyecto', descripcion: 'Plantilla Excel para gestión de cronogramas', categoria: 'proyecto', formato: 'xlsx', version: '3.0', descargas: 234, ultimaActualizacion: '2024-01-20', autor: 'PMO' },
  { id: 4, nombre: 'Presentación Ejecutiva', descripcion: 'Plantilla para presentaciones a comité ejecutivo', categoria: 'presentacion', formato: 'pptx', version: '1.5', descargas: 67, ultimaActualizacion: '2024-01-28', autor: 'Comunicaciones' },
  { id: 5, nombre: 'Formulario de Cambio', descripcion: 'Formulario para solicitudes de cambio de alcance', categoria: 'formulario', formato: 'docx', version: '2.0', descargas: 112, ultimaActualizacion: '2024-02-05', autor: 'PMO' },
  { id: 6, nombre: 'Contrato Marco', descripcion: 'Plantilla de contrato marco con proveedores', categoria: 'contrato', formato: 'docx', version: '1.2', descargas: 45, ultimaActualizacion: '2024-01-10', autor: 'Legal' },
];

const categoriaColors = {
  proyecto: 'bg-blue-100 text-blue-700',
  informe: 'bg-purple-100 text-purple-700',
  presentacion: 'bg-amber-100 text-amber-700',
  formulario: 'bg-green-100 text-green-700',
  contrato: 'bg-red-100 text-red-700',
};

const categoriaLabels = {
  proyecto: 'Proyecto',
  informe: 'Informe',
  presentacion: 'Presentación',
  formulario: 'Formulario',
  contrato: 'Contrato',
};

const formatoIcons = {
  docx: FileText,
  xlsx: FileSpreadsheet,
  pptx: FileText,
  pdf: File,
};

const formatoColors = {
  docx: 'text-blue-500 bg-blue-50',
  xlsx: 'text-green-500 bg-green-50',
  pptx: 'text-orange-500 bg-orange-50',
  pdf: 'text-red-500 bg-red-50',
};

export default function Plantillas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');

  const categorias = [...new Set(plantillas.map((p) => p.categoria))];

  const filteredPlantillas = plantillas.filter((p) => {
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategoria !== 'all' && p.categoria !== filterCategoria) return false;
    return true;
  });

  const stats = {
    totalPlantillas: plantillas.length,
    categorias: categorias.length,
    descargasTotales: plantillas.reduce((acc, p) => acc + p.descargas, 0),
    masDescargada: plantillas.reduce((prev, curr) => prev.descargas > curr.descargas ? prev : curr).nombre,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCode className="h-7 w-7 text-accent" />
            Gestión de Plantillas
          </h1>
          <p className="text-gray-500 mt-1">Plantillas y formatos institucionales</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Plantillas"
          value={stats.totalPlantillas}
          icon={FileCode}
          color="primary"
        />
        <KPICard
          title="Categorías"
          value={stats.categorias}
          icon={FileText}
          color="default"
        />
        <KPICard
          title="Descargas Totales"
          value={stats.descargasTotales}
          icon={Download}
          color="success"
        />
        <KPICard
          title="Más Popular"
          value={stats.masDescargada}
          icon={FileText}
          color="warning"
          subtitle="Mayor descargas"
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
            placeholder="Buscar plantilla..."
            className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{categoriaLabels[c]}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlantillas.map((plantilla) => {
          const FormatoIcon = formatoIcons[plantilla.formato];

          return (
            <div key={plantilla.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${formatoColors[plantilla.formato]}`}>
                  <FormatoIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{plantilla.nombre}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{plantilla.descripcion}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoriaColors[plantilla.categoria]}`}>
                  {categoriaLabels[plantilla.categoria]}
                </span>
                <span className="text-xs text-gray-500">v{plantilla.version}</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" />
                    {plantilla.descargas}
                  </span>
                  <span>{plantilla.autor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
