import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciativasService, usuariosService } from '../services/api';
import Card from '../components/common/Card';
import { PrioridadBadge } from '../components/common/Badge';
import {
  IniciativaPipeline,
  WorkflowMetrics,
  EstadoIniciativa,
  Area
} from '../types';
import {
  GitBranch,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Hourglass,
  FileCheck,
  Rocket,
  Archive,
  Calendar
} from 'lucide-react';

// Configuración de los estados del workflow
const WORKFLOW_STAGES = [
  { key: EstadoIniciativa.BORRADOR, label: 'Borrador', icon: FileCheck, color: 'bg-gray-100 border-gray-300', textColor: 'text-gray-700' },
  { key: EstadoIniciativa.ENVIADA, label: 'Enviada', icon: Clock, color: 'bg-blue-50 border-blue-300', textColor: 'text-blue-700' },
  { key: EstadoIniciativa.EN_REVISION, label: 'En Revisión', icon: Hourglass, color: 'bg-yellow-50 border-yellow-300', textColor: 'text-yellow-700' },
  { key: EstadoIniciativa.EN_EVALUACION, label: 'En Evaluación', icon: GitBranch, color: 'bg-purple-50 border-purple-300', textColor: 'text-purple-700' },
  { key: EstadoIniciativa.APROBADA, label: 'Aprobada', icon: CheckCircle2, color: 'bg-green-50 border-green-300', textColor: 'text-green-700' },
  { key: EstadoIniciativa.EN_BANCO_RESERVA, label: 'Banco Reserva', icon: Archive, color: 'bg-indigo-50 border-indigo-300', textColor: 'text-indigo-700' },
  { key: EstadoIniciativa.EN_PLAN_ANUAL, label: 'Plan Anual', icon: Calendar, color: 'bg-cyan-50 border-cyan-300', textColor: 'text-cyan-700' },
  { key: EstadoIniciativa.ACTIVADA, label: 'Activada', icon: Rocket, color: 'bg-emerald-50 border-emerald-300', textColor: 'text-emerald-700' },
];

const REJECTED_STAGE = { key: EstadoIniciativa.RECHAZADA, label: 'Rechazada', icon: XCircle, color: 'bg-red-50 border-red-300', textColor: 'text-red-700' };

export default function WorkflowPipeline() {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<IniciativaPipeline[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterArea, setFilterArea] = useState<number | ''>('');
  const [showRejected, setShowRejected] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterArea]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pipelineData, metricsData, areasData] = await Promise.all([
        iniciativasService.getPipeline(filterArea ? { area_id: filterArea } : {}),
        iniciativasService.getWorkflowMetrics(),
        usuariosService.getAreas()
      ]);
      setPipeline(pipelineData);
      setMetrics(metricsData);
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading pipeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitiativasByEstado = (estado: EstadoIniciativa) => {
    return pipeline.filter(ini => ini.estado === estado);
  };

  const getEstadoStats = (estado: string) => {
    return metrics?.por_estado.find(s => s.estado === estado);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Activación</h1>
          <p className="text-gray-500">Flujo end-to-end de iniciativas y proyectos</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value ? parseInt(e.target.value) : '')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todas las áreas</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.nombre}</option>
            ))}
          </select>
          <button
            onClick={() => setShowRejected(!showRejected)}
            className={`px-3 py-2 rounded-lg text-sm border ${
              showRejected ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-300 text-gray-600'
            }`}
          >
            <XCircle className="h-4 w-4 inline mr-1" />
            Rechazadas
          </button>
        </div>
      </div>

      {/* Métricas del Funnel */}
      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Iniciativas</p>
                <p className="text-3xl font-bold">{metrics.total_iniciativas}</p>
              </div>
              <GitBranch className="h-10 w-10 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tasa de Aprobación</p>
                <p className="text-3xl font-bold">{metrics.tasa_aprobacion}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Tasa de Rechazo</p>
                <p className="text-3xl font-bold">{metrics.tasa_rechazo}%</p>
              </div>
              <TrendingDown className="h-10 w-10 text-red-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">En Pipeline Activo</p>
                <p className="text-3xl font-bold">
                  {pipeline.filter(p =>
                    p.estado !== EstadoIniciativa.RECHAZADA &&
                    p.estado !== EstadoIniciativa.ACTIVADA
                  ).length}
                </p>
              </div>
              <Hourglass className="h-10 w-10 text-purple-200" />
            </div>
          </Card>
        </div>
      )}

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {WORKFLOW_STAGES.map((stage, index) => {
            const iniciativas = getInitiativasByEstado(stage.key);
            const stats = getEstadoStats(stage.key);
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex items-start">
                {/* Columna */}
                <div className={`w-72 rounded-lg border-2 ${stage.color} min-h-[500px]`}>
                  {/* Header de columna */}
                  <div className={`p-3 border-b ${stage.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-5 w-5 ${stage.textColor}`} />
                        <span className={`font-semibold ${stage.textColor}`}>{stage.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stage.textColor} bg-white/50`}>
                        {iniciativas.length}
                      </span>
                    </div>
                    {stats && stats.monto_total > 0 && (
                      <p className={`text-xs mt-1 ${stage.textColor} opacity-75`}>
                        {formatCurrency(stats.monto_total)}
                      </p>
                    )}
                  </div>

                  {/* Cards de iniciativas */}
                  <div className="p-2 space-y-2 max-h-[420px] overflow-y-auto">
                    {iniciativas.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">
                        Sin iniciativas
                      </p>
                    ) : (
                      iniciativas.map(ini => (
                        <div
                          key={ini.id}
                          onClick={() => navigate(`/iniciativas/${ini.id}`)}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-mono text-gray-500">{ini.codigo}</span>
                            {ini.prioridad && <PrioridadBadge prioridad={ini.prioridad} />}
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                            {ini.titulo}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="truncate max-w-[120px]">{ini.area_demandante_nombre}</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{ini.dias_en_estado}d</span>
                            </div>
                          </div>
                          {ini.urgencia === 'critica' && (
                            <div className="mt-2 flex items-center text-xs text-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Urgente
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Flecha entre columnas */}
                {index < WORKFLOW_STAGES.length - 1 && (
                  <div className="flex items-center px-1 h-[500px]">
                    <ChevronRight className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección de rechazadas (colapsable) */}
      {showRejected && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <XCircle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">Iniciativas Rechazadas</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              {getInitiativasByEstado(EstadoIniciativa.RECHAZADA).length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {getInitiativasByEstado(EstadoIniciativa.RECHAZADA).map(ini => (
              <div
                key={ini.id}
                onClick={() => navigate(`/iniciativas/${ini.id}`)}
                className="bg-red-50 rounded-lg p-3 border border-red-200 hover:shadow-md cursor-pointer"
              >
                <span className="text-xs font-mono text-gray-500">{ini.codigo}</span>
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mt-1">
                  {ini.titulo}
                </h4>
                <p className="text-xs text-gray-500 mt-2">{ini.area_demandante_nombre}</p>
              </div>
            ))}
            {getInitiativasByEstado(EstadoIniciativa.RECHAZADA).length === 0 && (
              <p className="text-gray-400 text-sm col-span-4 text-center py-4">
                No hay iniciativas rechazadas
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Leyenda */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Días en estado actual</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span>Urgencia crítica</span>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign className="h-3 w-3" />
          <span>Monto acumulado por etapa</span>
        </div>
      </div>
    </div>
  );
}
