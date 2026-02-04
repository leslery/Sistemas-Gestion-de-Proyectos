import { useState } from 'react';
import {
  Compass,
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileText,
  Users,
  ChevronRight,
  Upload,
  Eye,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';
import { FileUpload } from '../../components/ui/FileUpload';

interface ProyectoAnalisis {
  id: number;
  codigo: string;
  nombre: string;
  area: string;
  avance: number;
  estado: 'en_progreso' | 'completado' | 'pendiente';
  documentos: {
    requerimientos: boolean;
    disenoTecnico: boolean;
    disenoFuncional: boolean;
    prototipo: boolean;
  };
}

const proyectos: ProyectoAnalisis[] = [
  { id: 1, codigo: 'PRY-001', nombre: 'Modernización ERP', area: 'TI', avance: 65, estado: 'en_progreso', documentos: { requerimientos: true, disenoTecnico: true, disenoFuncional: false, prototipo: false } },
  { id: 2, codigo: 'PRY-002', nombre: 'Portal Autoatención', area: 'Comercial', avance: 100, estado: 'completado', documentos: { requerimientos: true, disenoTecnico: true, disenoFuncional: true, prototipo: true } },
  { id: 3, codigo: 'PRY-003', nombre: 'Sistema CRM', area: 'Comercial', avance: 30, estado: 'en_progreso', documentos: { requerimientos: true, disenoTecnico: false, disenoFuncional: false, prototipo: false } },
];

export default function AnalisisDiseno() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoAnalisis | null>(null);

  const filteredProyectos = proyectos.filter((p) =>
    !searchQuery || p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || p.codigo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Compass className="h-7 w-7 text-accent" />
            Análisis y Diseño
          </h1>
          <p className="text-gray-500 mt-1">Documentación de requerimientos y diseño técnico</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="En Análisis"
          value={proyectos.filter((p) => p.estado === 'en_progreso').length}
          icon={Compass}
          color="primary"
        />
        <KPICard
          title="Completados"
          value={proyectos.filter((p) => p.estado === 'completado').length}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Avance Promedio"
          value={`${Math.round(proyectos.reduce((acc, p) => acc + p.avance, 0) / proyectos.length)}%`}
          icon={Clock}
          color="default"
        />
        <KPICard
          title="Documentos Pendientes"
          value={proyectos.reduce((acc, p) => acc + Object.values(p.documentos).filter((d) => !d).length, 0)}
          icon={FileText}
          color="warning"
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyecto..."
            className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredProyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              onClick={() => setSelectedProyecto(proyecto)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                selectedProyecto?.id === proyecto.id
                  ? 'border-accent shadow-md'
                  : 'border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-accent">{proyecto.codigo}</span>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{proyecto.nombre}</p>
                  <p className="text-xs text-gray-500 mt-1">{proyecto.area}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  proyecto.estado === 'completado' ? 'bg-green-100 text-green-700' :
                  proyecto.estado === 'en_progreso' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {proyecto.avance}%
                </span>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      proyecto.estado === 'completado' ? 'bg-green-500' : 'bg-accent'
                    }`}
                    style={{ width: `${proyecto.avance}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {Object.entries(proyecto.documentos).map(([key, value]) => (
                  <div
                    key={key}
                    className={`w-6 h-6 rounded flex items-center justify-center ${
                      value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                    title={key}
                  >
                    {value ? <CheckCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedProyecto ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-accent">{selectedProyecto.codigo}</span>
                    <h2 className="text-xl font-semibold text-gray-900 mt-1">{selectedProyecto.nombre}</h2>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedProyecto.estado === 'completado' ? 'bg-green-100 text-green-700' :
                    selectedProyecto.estado === 'en_progreso' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedProyecto.estado === 'completado' ? 'Completado' :
                     selectedProyecto.estado === 'en_progreso' ? 'En Progreso' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="documentos">
                <TabList className="px-6">
                  <Tab value="documentos">Documentos</Tab>
                  <Tab value="equipo">Equipo</Tab>
                  <Tab value="upload">Cargar Documento</Tab>
                </TabList>

                <TabPanel value="documentos" className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'requerimientos', label: 'Especificación de Requerimientos', icon: FileText },
                      { key: 'disenoTecnico', label: 'Diseño Técnico', icon: Compass },
                      { key: 'disenoFuncional', label: 'Diseño Funcional', icon: Users },
                      { key: 'prototipo', label: 'Prototipo / Mockups', icon: Eye },
                    ].map((doc) => {
                      const completed = selectedProyecto.documentos[doc.key as keyof typeof selectedProyecto.documentos];
                      const Icon = doc.icon;
                      return (
                        <div
                          key={doc.key}
                          className={`p-4 rounded-lg border-2 ${
                            completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            {completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-3">{doc.label}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {completed ? (
                              <>
                                <button className="text-xs text-accent hover:text-accent/80">Ver documento</button>
                                <span className="text-gray-300">·</span>
                                <button className="text-xs text-gray-500 hover:text-gray-700">Actualizar</button>
                              </>
                            ) : (
                              <button className="text-xs text-accent hover:text-accent/80">Cargar documento</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabPanel>

                <TabPanel value="equipo" className="p-6">
                  <div className="space-y-4">
                    {[
                      { nombre: 'Juan Pérez', rol: 'Líder de Proyecto', avatar: 'JP' },
                      { nombre: 'María García', rol: 'Analista de Negocio', avatar: 'MG' },
                      { nombre: 'Carlos López', rol: 'Arquitecto de Soluciones', avatar: 'CL' },
                    ].map((miembro) => (
                      <div key={miembro.nombre} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-medium">
                          {miembro.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{miembro.nombre}</p>
                          <p className="text-xs text-gray-500">{miembro.rol}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabPanel>

                <TabPanel value="upload" className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent">
                        <option value="">Seleccionar tipo</option>
                        <option value="requerimientos">Especificación de Requerimientos</option>
                        <option value="disenoTecnico">Diseño Técnico</option>
                        <option value="disenoFuncional">Diseño Funcional</option>
                        <option value="prototipo">Prototipo / Mockups</option>
                      </select>
                    </div>
                    <FileUpload
                      onUpload={async (files) => {
                        console.log('Uploading:', files);
                      }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.figma"
                      maxSize={20}
                      maxFiles={3}
                    />
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Compass className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Selecciona un proyecto para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
