import { useState } from 'react';
import {
  TestTube,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Bug,
  FileText,
  Play,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';

interface CasoPrueba {
  id: number;
  nombre: string;
  tipo: 'funcional' | 'integracion' | 'rendimiento' | 'seguridad';
  estado: 'exitoso' | 'fallido' | 'pendiente' | 'en_ejecucion';
  modulo: string;
  prioridad: 'alta' | 'media' | 'baja';
}

interface ProyectoPruebas {
  id: number;
  codigo: string;
  nombre: string;
  casosPrueba: CasoPrueba[];
  bugs: { abiertos: number; cerrados: number; criticos: number };
}

const proyectos: ProyectoPruebas[] = [
  {
    id: 1,
    codigo: 'PRY-001',
    nombre: 'Modernización ERP',
    bugs: { abiertos: 8, cerrados: 45, criticos: 2 },
    casosPrueba: [
      { id: 1, nombre: 'Login con credenciales válidas', tipo: 'funcional', estado: 'exitoso', modulo: 'Autenticación', prioridad: 'alta' },
      { id: 2, nombre: 'Login con credenciales inválidas', tipo: 'funcional', estado: 'exitoso', modulo: 'Autenticación', prioridad: 'alta' },
      { id: 3, nombre: 'Integración con SAP', tipo: 'integracion', estado: 'fallido', modulo: 'Integraciones', prioridad: 'alta' },
      { id: 4, nombre: 'Carga de 1000 usuarios simultáneos', tipo: 'rendimiento', estado: 'pendiente', modulo: 'Performance', prioridad: 'media' },
      { id: 5, nombre: 'Inyección SQL en formularios', tipo: 'seguridad', estado: 'exitoso', modulo: 'Seguridad', prioridad: 'alta' },
      { id: 6, nombre: 'CRUD de productos', tipo: 'funcional', estado: 'en_ejecucion', modulo: 'Productos', prioridad: 'media' },
    ],
  },
];

const estadoConfig = {
  exitoso: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  fallido: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  pendiente: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
  en_ejecucion: { icon: Play, color: 'text-blue-600', bg: 'bg-blue-100' },
};

const tipoColors = {
  funcional: 'bg-purple-100 text-purple-700',
  integracion: 'bg-blue-100 text-blue-700',
  rendimiento: 'bg-orange-100 text-orange-700',
  seguridad: 'bg-red-100 text-red-700',
};

export default function Pruebas() {
  const [selectedProyecto] = useState<ProyectoPruebas>(proyectos[0]);
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  const filteredCasos = selectedProyecto.casosPrueba.filter((caso) => {
    if (filterTipo !== 'all' && caso.tipo !== filterTipo) return false;
    if (filterEstado !== 'all' && caso.estado !== filterEstado) return false;
    return true;
  });

  const stats = {
    total: selectedProyecto.casosPrueba.length,
    exitosos: selectedProyecto.casosPrueba.filter((c) => c.estado === 'exitoso').length,
    fallidos: selectedProyecto.casosPrueba.filter((c) => c.estado === 'fallido').length,
    pendientes: selectedProyecto.casosPrueba.filter((c) => c.estado === 'pendiente').length,
  };

  const cobertura = Math.round((stats.exitosos / stats.total) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TestTube className="h-7 w-7 text-accent" />
            Pruebas
          </h1>
          <p className="text-gray-500 mt-1">Gestión de casos de prueba y bugs</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            <Play className="h-4 w-4" />
            Ejecutar Suite
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard
          title="Cobertura"
          value={`${cobertura}%`}
          icon={TestTube}
          color={cobertura >= 80 ? 'success' : cobertura >= 60 ? 'warning' : 'danger'}
        />
        <KPICard
          title="Casos Exitosos"
          value={stats.exitosos}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Casos Fallidos"
          value={stats.fallidos}
          icon={XCircle}
          color="danger"
        />
        <KPICard
          title="Bugs Abiertos"
          value={selectedProyecto.bugs.abiertos}
          icon={Bug}
          color="warning"
          subtitle={`${selectedProyecto.bugs.criticos} críticos`}
        />
        <KPICard
          title="Bugs Cerrados"
          value={selectedProyecto.bugs.cerrados}
          icon={CheckCircle}
          color="default"
        />
      </div>

      <Tabs defaultValue="casos">
        <TabList>
          <Tab value="casos">Casos de Prueba</Tab>
          <Tab value="bugs">Bugs</Tab>
          <Tab value="reportes">Reportes</Tab>
        </TabList>

        <TabPanel value="casos">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            >
              <option value="all">Todos los tipos</option>
              <option value="funcional">Funcional</option>
              <option value="integracion">Integración</option>
              <option value="rendimiento">Rendimiento</option>
              <option value="seguridad">Seguridad</option>
            </select>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            >
              <option value="all">Todos los estados</option>
              <option value="exitoso">Exitoso</option>
              <option value="fallido">Fallido</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_ejecucion">En Ejecución</option>
            </select>
          </div>

          {/* Test Cases Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Caso de Prueba</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Módulo</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Prioridad</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCasos.map((caso) => {
                  const config = estadoConfig[caso.estado];
                  const Icon = config.icon;

                  return (
                    <tr key={caso.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{caso.nombre}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${tipoColors[caso.tipo]}`}>
                          {caso.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{caso.modulo}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          caso.prioridad === 'alta' ? 'bg-red-100 text-red-700' :
                          caso.prioridad === 'media' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {caso.prioridad}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${config.bg}`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <span className={`text-sm ${config.color}`}>
                            {caso.estado === 'exitoso' ? 'Exitoso' :
                             caso.estado === 'fallido' ? 'Fallido' :
                             caso.estado === 'en_ejecucion' ? 'En ejecución' : 'Pendiente'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-accent hover:text-accent/80 text-sm font-medium">
                          {caso.estado === 'pendiente' ? 'Ejecutar' : 'Ver detalle'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabPanel>

        <TabPanel value="bugs">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bugs Registrados</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-accent border border-accent rounded-lg hover:bg-accent/5">
                <Bug className="h-4 w-4" />
                Nuevo Bug
              </button>
            </div>
            <div className="space-y-3">
              {[
                { id: 1, titulo: 'Error en integración SAP', severidad: 'critica', estado: 'abierto', modulo: 'Integraciones' },
                { id: 2, titulo: 'Timeout en carga masiva', severidad: 'alta', estado: 'en_progreso', modulo: 'Performance' },
                { id: 3, titulo: 'UI desalineada en móvil', severidad: 'baja', estado: 'abierto', modulo: 'Frontend' },
              ].map((bug) => (
                <div key={bug.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    bug.severidad === 'critica' ? 'bg-red-100 text-red-600' :
                    bug.severidad === 'alta' ? 'bg-orange-100 text-orange-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    <Bug className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{bug.titulo}</p>
                    <p className="text-xs text-gray-500">{bug.modulo}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    bug.severidad === 'critica' ? 'bg-red-100 text-red-700' :
                    bug.severidad === 'alta' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {bug.severidad}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    bug.estado === 'abierto' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {bug.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabPanel>

        <TabPanel value="reportes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cobertura por Tipo</h3>
              <div className="space-y-3">
                {[
                  { tipo: 'Funcional', total: 15, exitosos: 12 },
                  { tipo: 'Integración', total: 8, exitosos: 5 },
                  { tipo: 'Rendimiento', total: 5, exitosos: 3 },
                  { tipo: 'Seguridad', total: 6, exitosos: 6 },
                ].map((item) => (
                  <div key={item.tipo}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.tipo}</span>
                      <span className="text-sm font-medium">{Math.round((item.exitosos / item.total) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${(item.exitosos / item.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Bugs</h3>
              <div className="h-[200px] flex items-end gap-4">
                {[12, 8, 15, 10, 6, 8, 5].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-red-200 rounded-t"
                      style={{ height: `${(val / 15) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500">S{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
