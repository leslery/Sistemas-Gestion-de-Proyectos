import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
  Star,
  Calendar,
  FileSpreadsheet,
  File,
  Presentation,
  RefreshCw,
} from 'lucide-react';

interface Plantilla {
  id: number;
  nombre: string;
  descripcion: string;
  fase: 'iniciacion' | 'planificacion' | 'ejecucion' | 'cierre';
  formato: 'docx' | 'xlsx' | 'pptx' | 'pdf';
  version: string;
  descargas: number;
  ultimaActualizacion: string;
  autor: string;
  destacada?: boolean;
}

const plantillasMock: Plantilla[] = [
  // Iniciación
  { id: 1, nombre: 'Project Charter', descripcion: 'Documento de inicio formal del proyecto', fase: 'iniciacion', formato: 'docx', version: '2.1', descargas: 89, ultimaActualizacion: '2026-01-15', autor: 'PMO', destacada: true },
  { id: 2, nombre: 'Business Case Template', descripcion: 'Plantilla de caso de negocio con análisis financiero', fase: 'iniciacion', formato: 'xlsx', version: '1.8', descargas: 67, ultimaActualizacion: '2026-01-10', autor: 'Finanzas' },
  { id: 3, nombre: 'Presentación Kick-off', descripcion: 'Template para reunión de inicio del proyecto', fase: 'iniciacion', formato: 'pptx', version: '3.0', descargas: 45, ultimaActualizacion: '2026-02-01', autor: 'PMO' },
  { id: 4, nombre: 'Análisis de Stakeholders', descripcion: 'Matriz de identificación y análisis de interesados', fase: 'iniciacion', formato: 'xlsx', version: '1.5', descargas: 34, ultimaActualizacion: '2026-01-01', autor: 'PMO' },

  // Planificación
  { id: 5, nombre: 'Cronograma de Proyecto', descripcion: 'Plantilla Gantt para gestión de cronogramas', fase: 'planificacion', formato: 'xlsx', version: '4.2', descargas: 156, ultimaActualizacion: '2026-01-20', autor: 'PMO' },
  { id: 6, nombre: 'Plan de Gestión de Riesgos', descripcion: 'Template para identificación y gestión de riesgos', fase: 'planificacion', formato: 'docx', version: '2.0', descargas: 78, ultimaActualizacion: '2026-01-18', autor: 'PMO' },
  { id: 7, nombre: 'Matriz de Responsabilidades RACI', descripcion: 'Plantilla RACI para asignación de roles', fase: 'planificacion', formato: 'xlsx', version: '1.3', descargas: 92, ultimaActualizacion: '2026-01-25', autor: 'PMO' },
  { id: 8, nombre: 'Plan de Comunicaciones', descripcion: 'Template para estrategia de comunicación', fase: 'planificacion', formato: 'docx', version: '1.7', descargas: 43, ultimaActualizacion: '2026-01-12', autor: 'Comunicaciones' },

  // Ejecución
  { id: 9, nombre: 'Informe de Avance Semanal', descripcion: 'Reporte de progreso semanal del proyecto', fase: 'ejecucion', formato: 'docx', version: '2.5', descargas: 234, ultimaActualizacion: '2026-02-01', autor: 'PMO' },
  { id: 10, nombre: 'Solicitud de Cambio', descripcion: 'Formulario para solicitudes de cambio de alcance', fase: 'ejecucion', formato: 'docx', version: '3.1', descargas: 112, ultimaActualizacion: '2026-01-28', autor: 'PMO' },
  { id: 11, nombre: 'Acta de Reunión', descripcion: 'Template para documentar reuniones', fase: 'ejecucion', formato: 'docx', version: '1.2', descargas: 189, ultimaActualizacion: '2026-01-15', autor: 'PMO' },
  { id: 12, nombre: 'Control de Issues', descripcion: 'Plantilla para seguimiento de problemas', fase: 'ejecucion', formato: 'xlsx', version: '2.0', descargas: 67, ultimaActualizacion: '2026-01-22', autor: 'PMO' },

  // Cierre
  { id: 13, nombre: 'Informe de Cierre', descripcion: 'Documento de cierre formal del proyecto', fase: 'cierre', formato: 'docx', version: '2.3', descargas: 56, ultimaActualizacion: '2026-01-30', autor: 'PMO' },
  { id: 14, nombre: 'Lecciones Aprendidas', descripcion: 'Template para documentar lecciones del proyecto', fase: 'cierre', formato: 'docx', version: '1.8', descargas: 48, ultimaActualizacion: '2026-01-25', autor: 'PMO' },
  { id: 15, nombre: 'Acta de Aceptación', descripcion: 'Documento de aceptación de entregables', fase: 'cierre', formato: 'docx', version: '2.1', descargas: 89, ultimaActualizacion: '2026-02-02', autor: 'PMO' },
  { id: 16, nombre: 'Evaluación de Proveedores', descripcion: 'Plantilla para evaluar desempeño de proveedores', fase: 'cierre', formato: 'xlsx', version: '1.5', descargas: 34, ultimaActualizacion: '2026-01-20', autor: 'Compras' },
];

const faseLabels: Record<string, string> = {
  iniciacion: 'Iniciación',
  planificacion: 'Planificación',
  ejecucion: 'Ejecución',
  cierre: 'Cierre',
};

const faseColors: Record<string, string> = {
  iniciacion: 'bg-blue-100 text-blue-700',
  planificacion: 'bg-purple-100 text-purple-700',
  ejecucion: 'bg-green-100 text-green-700',
  cierre: 'bg-amber-100 text-amber-700',
};

const formatoConfig: Record<string, { icon: any; color: string; bg: string }> = {
  docx: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  xlsx: { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-100' },
  pptx: { icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-100' },
  pdf: { icon: File, color: 'text-red-600', bg: 'bg-red-100' },
};

export default function Plantillas() {
  const [activeTab, setActiveTab] = useState<'iniciacion' | 'planificacion' | 'ejecucion' | 'cierre'>('iniciacion');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredPlantillas = plantillasMock.filter((p) => {
    if (p.fase !== activeTab) return false;
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalPlantillas: plantillasMock.length,
    descargasMes: plantillasMock.reduce((acc, p) => acc + p.descargas, 0),
    masDescargada: plantillasMock.reduce((prev, curr) => prev.descargas > curr.descargas ? prev : curr),
    actualizadasMes: 5,
  };

  const tabs = [
    { id: 'iniciacion', label: 'Iniciación', count: plantillasMock.filter(p => p.fase === 'iniciacion').length },
    { id: 'planificacion', label: 'Planificación', count: plantillasMock.filter(p => p.fase === 'planificacion').length },
    { id: 'ejecucion', label: 'Ejecución', count: plantillasMock.filter(p => p.fase === 'ejecucion').length },
    { id: 'cierre', label: 'Cierre', count: plantillasMock.filter(p => p.fase === 'cierre').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-accent" />
            Plantillas de Documentos
          </h1>
          <p className="text-gray-500 mt-1">Templates estándar para gestión de proyectos</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Subir Plantilla
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlantillas}</p>
              <p className="text-sm text-gray-500">Plantillas Disponibles</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.descargasMes}</p>
              <p className="text-sm text-gray-500">Descargas (mes)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 truncate">{stats.masDescargada.nombre}</p>
              <p className="text-sm text-gray-500">Más Descargada</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.actualizadasMes}</p>
              <p className="text-sm text-gray-500">Actualizadas (mes)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plantilla..."
                className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPlantillas.map((plantilla) => {
              const formato = formatoConfig[plantilla.formato];
              const FormatoIcon = formato.icon;

              return (
                <div
                  key={plantilla.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-accent/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${formato.bg}`}>
                      <FormatoIcon className={`h-6 w-6 ${formato.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">{plantilla.nombre}</h3>
                        {plantilla.destacada && (
                          <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{plantilla.descripcion}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(plantilla.ultimaActualizacion).toLocaleDateString('es-CL')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" />
                      {plantilla.descargas}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{plantilla.autor} · v{plantilla.version}</span>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                        title="Vista previa"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 text-white bg-accent hover:bg-accent/90 rounded transition-colors"
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPlantillas.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <FileText className="h-12 w-12 mb-3" />
              <p className="text-sm">No se encontraron plantillas</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Nueva Plantilla</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="Nombre de la plantilla"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  rows={2}
                  placeholder="Descripción breve"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent">
                  <option value="iniciacion">Iniciación</option>
                  <option value="planificacion">Planificación</option>
                  <option value="ejecucion">Ejecución</option>
                  <option value="cierre">Cierre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Arrastre o haga clic para seleccionar</p>
                  <p className="text-xs text-gray-400 mt-1">DOCX, XLSX, PPTX, PDF (máx. 10MB)</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Subir Plantilla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
