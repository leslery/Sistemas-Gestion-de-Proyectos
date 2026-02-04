import { useEffect, useState } from 'react';
import { iniciativasService } from '../../services/api';
import { HistorialEstado, EstadoIniciativa } from '../../types';
import {
  CheckCircle,
  Circle,
  Clock,
  User,
  MessageSquare,
  ArrowRight,
  FileCheck,
  Send,
  Search,
  Users,
  ThumbsUp,
  Archive,
  Calendar,
  Rocket,
  XCircle,
  ChevronDown,
  ChevronUp,
  Timer,
  Info
} from 'lucide-react';

interface WorkflowTimelineProps {
  iniciativaId: number;
  estadoActual: EstadoIniciativa;
}

// Definición del flujo de estados
const WORKFLOW_STEPS = [
  { estado: EstadoIniciativa.BORRADOR, label: 'Borrador', icon: FileCheck, description: 'Iniciativa en preparación' },
  { estado: EstadoIniciativa.ENVIADA, label: 'Enviada', icon: Send, description: 'Enviada para revisión' },
  { estado: EstadoIniciativa.EN_REVISION, label: 'En Revisión', icon: Search, description: 'Revisión por TD' },
  { estado: EstadoIniciativa.EN_EVALUACION, label: 'Evaluación', icon: Users, description: 'Evaluación del comité' },
  { estado: EstadoIniciativa.APROBADA, label: 'Aprobada', icon: ThumbsUp, description: 'Aprobada por StrateGrid' },
  { estado: EstadoIniciativa.EN_BANCO_RESERVA, label: 'Banco Reserva', icon: Archive, description: 'Esperando asignación' },
  { estado: EstadoIniciativa.EN_PLAN_ANUAL, label: 'Plan Anual', icon: Calendar, description: 'Incluida en plan' },
  { estado: EstadoIniciativa.ACTIVADA, label: 'Activada', icon: Rocket, description: 'Proyecto en ejecución' },
];

const getStepIndex = (estado: EstadoIniciativa) => {
  return WORKFLOW_STEPS.findIndex(s => s.estado === estado);
};

// Calcular tiempo transcurrido entre fechas
const calcularTiempoEnEstado = (fechaInicio: string, fechaFin?: string): string => {
  const inicio = new Date(fechaInicio);
  const fin = fechaFin ? new Date(fechaFin) : new Date();
  const diffMs = fin.getTime() - inicio.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays} día${diffDays > 1 ? 's' : ''} ${diffHours}h`;
  }
  return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
};

export default function WorkflowTimeline({ iniciativaId, estadoActual }: WorkflowTimelineProps) {
  const [historial, setHistorial] = useState<HistorialEstado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<EstadoIniciativa | null>(null);
  const [viewMode, setViewMode] = useState<'stepper' | 'detailed'>('stepper');

  useEffect(() => {
    loadHistorial();
  }, [iniciativaId]);

  const loadHistorial = async () => {
    try {
      const data = await iniciativasService.getHistorial(iniciativaId);
      setHistorial(data);
    } catch (error) {
      console.error('Error loading historial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = getStepIndex(estadoActual);
  const isRejected = estadoActual === EstadoIniciativa.RECHAZADA;

  const getHistorialForEstado = (estado: EstadoIniciativa) => {
    return historial.find(h => h.estado_nuevo === estado);
  };

  // Obtener el tiempo que estuvo en un estado específico
  const getTiempoEnEstado = (estado: EstadoIniciativa) => {
    const entrada = historial.find(h => h.estado_nuevo === estado);
    if (!entrada) return null;

    // Buscar cuando salió de este estado
    const salidaIndex = historial.findIndex(h => h.estado_anterior === estado);
    const salida = salidaIndex !== -1 ? historial[salidaIndex] : null;

    return {
      entrada: entrada.fecha,
      salida: salida?.fecha,
      usuario: entrada.usuario_nombre,
      comentario: entrada.comentario,
      tiempoTotal: calcularTiempoEnEstado(entrada.fecha, salida?.fecha)
    };
  };

  const toggleStage = (estado: EstadoIniciativa) => {
    setExpandedStage(expandedStage === estado ? null : estado);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 w-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle de vista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('stepper')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'stepper'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Vista Resumen
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'detailed'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Vista Detallada
          </button>
        </div>
        {historial.length > 0 && (
          <span className="text-xs text-gray-400">
            {historial.length} cambio{historial.length !== 1 ? 's' : ''} registrado{historial.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {viewMode === 'stepper' ? (
        <>
          {/* Stepper Visual Compacto */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {WORKFLOW_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = !isRejected && index < currentStepIndex;
                const isCurrent = !isRejected && index === currentStepIndex;
                const isPending = !isRejected && index > currentStepIndex;
                const historialItem = getHistorialForEstado(step.estado);
                const tiempoInfo = getTiempoEnEstado(step.estado);

                return (
                  <div
                    key={step.estado}
                    className={`flex flex-col items-center relative group cursor-pointer ${
                      historialItem ? 'hover:scale-105 transition-transform' : ''
                    }`}
                    onClick={() => historialItem && toggleStage(step.estado)}
                  >
                    {/* Línea conectora */}
                    {index > 0 && (
                      <div
                        className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${
                          isCompleted || isCurrent ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        style={{ width: 'calc(100% + 2rem)', transform: 'translateX(-50%)' }}
                      />
                    )}

                    {/* Círculo del paso */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        transition-all duration-300
                        ${isCompleted ? 'bg-green-500 text-white' : ''}
                        ${isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-100' : ''}
                        ${isPending ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
                        ${isRejected && index <= currentStepIndex ? 'bg-red-100 text-red-500' : ''}
                        ${expandedStage === step.estado ? 'ring-2 ring-primary-400' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`
                        mt-2 text-xs font-medium text-center max-w-[80px]
                        ${isCurrent ? 'text-primary-700' : ''}
                        ${isCompleted ? 'text-green-700' : ''}
                        ${isPending ? 'text-gray-400' : ''}
                      `}
                    >
                      {step.label}
                    </span>

                    {/* Indicador de tiempo */}
                    {tiempoInfo && (
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {tiempoInfo.tiempoTotal}
                      </span>
                    )}

                    {/* Tooltip con más info */}
                    {historialItem && (
                      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2
                                      opacity-0 group-hover:opacity-100 transition-opacity
                                      bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10
                                      shadow-lg">
                        <div className="font-medium">{formatDate(historialItem.fecha)}</div>
                        {historialItem.usuario_nombre && (
                          <div className="text-gray-300">por {historialItem.usuario_nombre}</div>
                        )}
                        <div className="text-gray-400 text-[10px] mt-1">Click para ver detalles</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Estado rechazado (si aplica) */}
            {isRejected && (
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Iniciativa Rechazada</span>
                </div>
              </div>
            )}
          </div>

          {/* Panel expandido para etapa seleccionada */}
          {expandedStage && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const step = WORKFLOW_STEPS.find(s => s.estado === expandedStage);
                    const Icon = step?.icon || Circle;
                    return (
                      <>
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{step?.label}</h4>
                          <p className="text-xs text-gray-500">{step?.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setExpandedStage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </div>

              {(() => {
                const tiempoInfo = getTiempoEnEstado(expandedStage);
                if (!tiempoInfo) return null;

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center space-x-2 text-gray-500 text-xs mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>Fecha Entrada</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(tiempoInfo.entrada)}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center space-x-2 text-gray-500 text-xs mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>Fecha Salida</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {tiempoInfo.salida ? formatDate(tiempoInfo.salida) : 'Estado actual'}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center space-x-2 text-gray-500 text-xs mb-1">
                        <Timer className="h-3 w-3" />
                        <span>Tiempo en Etapa</span>
                      </div>
                      <p className="text-sm font-medium text-primary-600">
                        {tiempoInfo.tiempoTotal}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center space-x-2 text-gray-500 text-xs mb-1">
                        <User className="h-3 w-3" />
                        <span>Responsable</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {tiempoInfo.usuario || '-'}
                      </p>
                    </div>

                    {tiempoInfo.comentario && (
                      <div className="col-span-full bg-white p-3 rounded-lg border">
                        <div className="flex items-center space-x-2 text-gray-500 text-xs mb-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Comentario</span>
                        </div>
                        <p className="text-sm text-gray-700">{tiempoInfo.comentario}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      ) : (
        /* Vista Detallada por Etapas */
        <div className="space-y-3">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = !isRejected && index < currentStepIndex;
            const isCurrent = !isRejected && index === currentStepIndex;
            const isPending = !isRejected && index > currentStepIndex;
            const tiempoInfo = getTiempoEnEstado(step.estado);
            const isExpanded = expandedStage === step.estado;

            return (
              <div
                key={step.estado}
                className={`
                  border rounded-lg overflow-hidden transition-all
                  ${isCompleted ? 'border-green-200 bg-green-50/50' : ''}
                  ${isCurrent ? 'border-primary-300 bg-primary-50/50 ring-1 ring-primary-200' : ''}
                  ${isPending ? 'border-gray-200 bg-gray-50/50 opacity-60' : ''}
                `}
              >
                <button
                  onClick={() => tiempoInfo && toggleStage(step.estado)}
                  disabled={!tiempoInfo}
                  className={`
                    w-full flex items-center justify-between p-4 text-left
                    ${tiempoInfo ? 'hover:bg-white/50 cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isCompleted ? 'bg-green-500 text-white' : ''}
                        ${isCurrent ? 'bg-primary-600 text-white' : ''}
                        ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                      `}
                    >
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isPending ? 'text-gray-300' : 'text-gray-500'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {tiempoInfo && (
                      <>
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-500">Tiempo en etapa</p>
                          <p className="text-sm font-medium text-gray-900">{tiempoInfo.tiempoTotal}</p>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </>
                    )}
                    {!tiempoInfo && isPending && (
                      <span className="text-xs text-gray-400">Pendiente</span>
                    )}
                  </div>
                </button>

                {/* Detalles expandidos */}
                {isExpanded && tiempoInfo && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>Entrada</span>
                        </div>
                        <p className="text-sm font-medium">{formatDate(tiempoInfo.entrada)}</p>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>Salida</span>
                        </div>
                        <p className="text-sm font-medium">
                          {tiempoInfo.salida ? formatDate(tiempoInfo.salida) : 'Estado actual'}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
                          <Timer className="h-3 w-3" />
                          <span>Duración</span>
                        </div>
                        <p className="text-sm font-medium text-primary-600">{tiempoInfo.tiempoTotal}</p>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
                          <User className="h-3 w-3" />
                          <span>Usuario</span>
                        </div>
                        <p className="text-sm font-medium">{tiempoInfo.usuario || '-'}</p>
                      </div>
                    </div>

                    {tiempoInfo.comentario && (
                      <div className="bg-white p-3 rounded border mt-3">
                        <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Comentario</span>
                        </div>
                        <p className="text-sm text-gray-700">{tiempoInfo.comentario}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Mostrar estado rechazado si aplica */}
          {isRejected && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-red-900">Rechazada</h4>
                  <p className="text-sm text-red-600">La iniciativa fue rechazada</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial cronológico (colapsable) */}
      {historial.length > 0 && (
        <details className="border-t pt-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>Ver historial cronológico completo ({historial.length} eventos)</span>
          </summary>
          <div className="space-y-3 mt-4">
            {historial.map((item, index) => (
              <div
                key={item.id}
                className={`
                  flex items-start space-x-3 p-3 rounded-lg
                  ${index === historial.length - 1 ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50'}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${item.estado_nuevo === EstadoIniciativa.RECHAZADA ? 'bg-red-100' : 'bg-green-100'}
                `}>
                  {item.estado_nuevo === EstadoIniciativa.RECHAZADA ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {item.estado_anterior && (
                      <>
                        <span className="text-sm text-gray-500">
                          {WORKFLOW_STEPS.find(s => s.estado === item.estado_anterior)?.label || item.estado_anterior}
                        </span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      </>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {WORKFLOW_STEPS.find(s => s.estado === item.estado_nuevo)?.label ||
                       (item.estado_nuevo === EstadoIniciativa.RECHAZADA ? 'Rechazada' : item.estado_nuevo)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(item.fecha)}</span>
                    </div>
                    {item.usuario_nombre && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{item.usuario_nombre}</span>
                      </div>
                    )}
                  </div>

                  {item.comentario && (
                    <div className="flex items-start space-x-1 mt-2 text-sm text-gray-600">
                      <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{item.comentario}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {historial.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          No hay historial de cambios de estado registrado
        </div>
      )}
    </div>
  );
}
