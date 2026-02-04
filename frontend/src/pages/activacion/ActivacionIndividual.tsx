import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Play,
  FileText,
} from 'lucide-react';
import { Timeline } from '../../components/ui/Timeline';

interface IniciativaActivacion {
  id: number;
  codigo: string;
  titulo: string;
  area: string;
  monto: number;
  estado: 'pendiente_revision' | 'en_scoring' | 'pendiente_evaluacion' | 'lista_activacion';
  prioridad?: string;
  puntaje?: number;
  fechaSolicitud: string;
  diasEnEstado: number;
}

const iniciativas: IniciativaActivacion[] = [
  { id: 1, codigo: 'INI-0048', titulo: 'Sistema de Monitoreo IoT', area: 'Operaciones', monto: 350000000, estado: 'lista_activacion', prioridad: 'P1', puntaje: 85, fechaSolicitud: '2024-01-15', diasEnEstado: 3 },
  { id: 2, codigo: 'INI-0049', titulo: 'App Móvil Clientes', area: 'Comercial', monto: 180000000, estado: 'pendiente_evaluacion', fechaSolicitud: '2024-01-20', diasEnEstado: 5 },
  { id: 3, codigo: 'INI-0050', titulo: 'Integración SAP', area: 'TI', monto: 420000000, estado: 'en_scoring', fechaSolicitud: '2024-01-25', diasEnEstado: 2 },
  { id: 4, codigo: 'INI-0051', titulo: 'Portal Proveedores', area: 'Compras', monto: 95000000, estado: 'pendiente_revision', fechaSolicitud: '2024-02-01', diasEnEstado: 1 },
];

const estadoConfig = {
  pendiente_revision: { label: 'Pendiente Revisión', color: 'bg-gray-100 text-gray-700', icon: Clock },
  en_scoring: { label: 'En Scoring', color: 'bg-blue-100 text-blue-700', icon: FileText },
  pendiente_evaluacion: { label: 'Pendiente Evaluación', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  lista_activacion: { label: 'Lista para Activar', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function ActivacionIndividual() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [selectedIniciativa, setSelectedIniciativa] = useState<IniciativaActivacion | null>(null);

  const filteredIniciativas = iniciativas.filter((ini) => {
    if (searchQuery && !ini.titulo.toLowerCase().includes(searchQuery.toLowerCase()) && !ini.codigo.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterEstado !== 'all' && ini.estado !== filterEstado) {
      return false;
    }
    return true;
  });

  const workflowSteps = [
    { id: '1', title: 'Recepción', description: 'Iniciativa recibida', status: 'completed' as const },
    { id: '2', title: 'Revisión TD', description: 'Análisis técnico', status: selectedIniciativa?.estado === 'pendiente_revision' ? 'current' as const : 'completed' as const },
    { id: '3', title: 'Scoring', description: 'Cálculo de puntaje', status: selectedIniciativa?.estado === 'en_scoring' ? 'current' as const : selectedIniciativa?.estado === 'pendiente_revision' ? 'pending' as const : 'completed' as const },
    { id: '4', title: 'Evaluación', description: 'Comité de expertos', status: selectedIniciativa?.estado === 'pendiente_evaluacion' ? 'current' as const : ['pendiente_revision', 'en_scoring'].includes(selectedIniciativa?.estado || '') ? 'pending' as const : 'completed' as const },
    { id: '5', title: 'Activación', description: 'Crear proyecto', status: selectedIniciativa?.estado === 'lista_activacion' ? 'current' as const : 'pending' as const },
  ];

  const handleActivar = (iniciativa: IniciativaActivacion) => {
    // Navigate to project creation or activate directly
    console.log('Activando iniciativa:', iniciativa.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-7 w-7 text-accent" />
            Activación Individual
          </h1>
          <p className="text-gray-500 mt-1">Workflow simplificado de activación de iniciativas</p>
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
            placeholder="Buscar por código o título..."
            className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente_revision">Pendiente Revisión</option>
          <option value="en_scoring">En Scoring</option>
          <option value="pendiente_evaluacion">Pendiente Evaluación</option>
          <option value="lista_activacion">Lista para Activar</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Iniciativas */}
        <div className="lg:col-span-2 space-y-3">
          {filteredIniciativas.map((iniciativa) => {
            const config = estadoConfig[iniciativa.estado];
            const Icon = config.icon;

            return (
              <div
                key={iniciativa.id}
                onClick={() => setSelectedIniciativa(iniciativa)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedIniciativa?.id === iniciativa.id
                    ? 'border-accent shadow-md'
                    : 'border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-accent">{iniciativa.codigo}</span>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{iniciativa.titulo}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{iniciativa.area}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">
                            ${(iniciativa.monto / 1000000).toFixed(0)}M
                          </span>
                          {iniciativa.prioridad && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className={`text-xs font-medium ${
                                iniciativa.prioridad === 'P1' ? 'text-red-600' :
                                iniciativa.prioridad === 'P2' ? 'text-amber-600' : 'text-gray-600'
                              }`}>
                                {iniciativa.prioridad}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${config.color}`}>
                          {config.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{iniciativa.diasEnEstado} días</p>
                      </div>
                    </div>

                    {iniciativa.estado === 'lista_activacion' && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Puntaje:</span>
                          <span className="text-sm font-semibold text-accent">{iniciativa.puntaje}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivar(iniciativa);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          <Play className="h-4 w-4" />
                          Activar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredIniciativas.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No se encontraron iniciativas</p>
            </div>
          )}
        </div>

        {/* Panel de Workflow */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedIniciativa ? 'Estado del Workflow' : 'Selecciona una Iniciativa'}
          </h3>

          {selectedIniciativa ? (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-accent">{selectedIniciativa.codigo}</span>
                <p className="text-sm font-medium text-gray-900 mt-1">{selectedIniciativa.titulo}</p>
              </div>

              <Timeline items={workflowSteps} />

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Próxima Acción</h4>
                {selectedIniciativa.estado === 'pendiente_revision' && (
                  <button className="w-full py-2 px-4 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
                    Iniciar Revisión
                  </button>
                )}
                {selectedIniciativa.estado === 'en_scoring' && (
                  <button className="w-full py-2 px-4 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
                    Calcular Scoring
                  </button>
                )}
                {selectedIniciativa.estado === 'pendiente_evaluacion' && (
                  <button className="w-full py-2 px-4 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
                    Ver en Comité
                  </button>
                )}
                {selectedIniciativa.estado === 'lista_activacion' && (
                  <button
                    onClick={() => handleActivar(selectedIniciativa)}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Activar Proyecto
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ChevronRight className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">Selecciona una iniciativa para ver su workflow</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
