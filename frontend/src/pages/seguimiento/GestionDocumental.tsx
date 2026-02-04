import { useState } from 'react';
import {
  FileArchive,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Trash2,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { FileUpload } from '../../components/ui/FileUpload';

interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  proyecto: string;
  categoria: string;
  tamaño: string;
  fechaSubida: string;
  subidoPor: string;
  version: string;
}

const documentos: Documento[] = [
  { id: 1, nombre: 'Especificación de Requerimientos v2.1.pdf', tipo: 'pdf', proyecto: 'Modernización ERP', categoria: 'Análisis', tamaño: '2.4 MB', fechaSubida: '2024-02-10', subidoPor: 'Juan Pérez', version: '2.1' },
  { id: 2, nombre: 'Diseño Arquitectura.pdf', tipo: 'pdf', proyecto: 'Modernización ERP', categoria: 'Diseño', tamaño: '5.1 MB', fechaSubida: '2024-02-08', subidoPor: 'Carlos López', version: '1.0' },
  { id: 3, nombre: 'Plan de Pruebas.xlsx', tipo: 'excel', proyecto: 'Portal Autoatención', categoria: 'Pruebas', tamaño: '890 KB', fechaSubida: '2024-02-05', subidoPor: 'María García', version: '1.2' },
  { id: 4, nombre: 'Manual de Usuario.docx', tipo: 'word', proyecto: 'Sistema CRM', categoria: 'Documentación', tamaño: '1.8 MB', fechaSubida: '2024-02-01', subidoPor: 'Ana Rodríguez', version: '1.0' },
  { id: 5, nombre: 'Diagrama de Flujo.png', tipo: 'image', proyecto: 'Modernización ERP', categoria: 'Diseño', tamaño: '450 KB', fechaSubida: '2024-01-28', subidoPor: 'Carlos López', version: '1.0' },
];

const tipoIcons = {
  pdf: FileText,
  excel: FileSpreadsheet,
  word: FileText,
  image: FileImage,
  default: File,
};

const tipoColors = {
  pdf: 'text-red-500 bg-red-50',
  excel: 'text-green-500 bg-green-50',
  word: 'text-blue-500 bg-blue-50',
  image: 'text-purple-500 bg-purple-50',
  default: 'text-gray-500 bg-gray-50',
};

export default function GestionDocumental() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProyecto, setFilterProyecto] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);

  const proyectos = [...new Set(documentos.map((d) => d.proyecto))];
  const categorias = [...new Set(documentos.map((d) => d.categoria))];

  const filteredDocumentos = documentos.filter((d) => {
    if (searchQuery && !d.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterProyecto !== 'all' && d.proyecto !== filterProyecto) return false;
    if (filterCategoria !== 'all' && d.categoria !== filterCategoria) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileArchive className="h-7 w-7 text-accent" />
            Gestión Documental
          </h1>
          <p className="text-gray-500 mt-1">Repositorio de documentos de proyectos</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Subir Documento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Documentos"
          value={documentos.length}
          icon={FileArchive}
          color="primary"
        />
        <KPICard
          title="Proyectos"
          value={proyectos.length}
          icon={FolderOpen}
          color="default"
        />
        <KPICard
          title="Categorías"
          value={categorias.length}
          icon={FileText}
          color="default"
        />
        <KPICard
          title="Espacio Usado"
          value="12.5 MB"
          icon={FileArchive}
          color="default"
        />
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Nuevo Documento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent">
              <option value="">Seleccionar proyecto</option>
              {proyectos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent">
              <option value="">Seleccionar categoría</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Versión (ej: 1.0)"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <FileUpload
            onUpload={async (files) => {
              console.log('Uploading:', files);
              setShowUpload(false);
            }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            maxSize={20}
            maxFiles={5}
          />
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
            placeholder="Buscar documento..."
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
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Documento</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proyecto</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Categoría</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Versión</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Fecha</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDocumentos.map((doc) => {
              const Icon = tipoIcons[doc.tipo as keyof typeof tipoIcons] || tipoIcons.default;
              const colors = tipoColors[doc.tipo as keyof typeof tipoColors] || tipoColors.default;

              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{doc.nombre}</p>
                        <p className="text-xs text-gray-500">{doc.tamaño} · {doc.subidoPor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.proyecto}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      {doc.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">v{doc.version}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(doc.fechaSubida).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="h-4 w-4" />
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
