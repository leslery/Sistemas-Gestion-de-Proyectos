import { Check, Clock, Circle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export type FaseStatus = 'completada' | 'en_progreso' | 'pendiente' | 'bloqueada';

export interface Fase {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  avance: number;
  estado: FaseStatus;
}

interface FaseTimelineProps {
  fases: Fase[];
  orientation?: 'horizontal' | 'vertical';
  onFaseClick?: (fase: Fase) => void;
  className?: string;
}

const statusConfig: Record<FaseStatus, { icon: typeof Check; color: string; bgColor: string; borderColor: string }> = {
  completada: {
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
  },
  en_progreso: {
    icon: Clock,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent',
  },
  pendiente: {
    icon: Circle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  bloqueada: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
  },
};

const statusLabels: Record<FaseStatus, string> = {
  completada: 'Completada',
  en_progreso: 'En Progreso',
  pendiente: 'Pendiente',
  bloqueada: 'Bloqueada',
};

export function FaseTimeline({ fases, orientation = 'horizontal', onFaseClick, className }: FaseTimelineProps) {
  if (orientation === 'vertical') {
    return (
      <div className={clsx('space-y-4', className)}>
        {fases.map((fase, index) => {
          const config = statusConfig[fase.estado];
          const Icon = config.icon;

          return (
            <div
              key={fase.id}
              onClick={() => onFaseClick?.(fase)}
              className={clsx(
                'relative flex gap-4',
                onFaseClick && 'cursor-pointer'
              )}
            >
              {/* Connector line */}
              {index < fases.length - 1 && (
                <div
                  className={clsx(
                    'absolute left-4 top-10 w-0.5 h-full -ml-px',
                    fase.estado === 'completada' ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2',
                  config.bgColor,
                  config.borderColor
                )}
              >
                <Icon className={clsx('h-4 w-4', config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className={clsx(
                    'text-sm font-medium',
                    fase.estado === 'en_progreso' ? 'text-accent' :
                    fase.estado === 'completada' ? 'text-gray-900' : 'text-gray-500'
                  )}>
                    {fase.nombre}
                  </h4>
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded',
                    config.bgColor,
                    config.color
                  )}>
                    {statusLabels[fase.estado]}
                  </span>
                </div>
                {fase.descripcion && (
                  <p className="text-xs text-gray-500 mt-1">{fase.descripcion}</p>
                )}
                {fase.estado !== 'pendiente' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Avance</span>
                      <span>{fase.avance}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all',
                          fase.estado === 'completada' ? 'bg-green-500' :
                          fase.estado === 'bloqueada' ? 'bg-red-500' : 'bg-accent'
                        )}
                        style={{ width: `${fase.avance}%` }}
                      />
                    </div>
                  </div>
                )}
                {(fase.fechaInicio || fase.fechaFin) && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    {fase.fechaInicio && <span>Inicio: {new Date(fase.fechaInicio).toLocaleDateString('es-CL')}</span>}
                    {fase.fechaInicio && fase.fechaFin && <span>·</span>}
                    {fase.fechaFin && <span>Fin: {new Date(fase.fechaFin).toLocaleDateString('es-CL')}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={clsx('flex items-start', className)}>
      {fases.map((fase, index) => {
        const config = statusConfig[fase.estado];
        const Icon = config.icon;

        return (
          <div
            key={fase.id}
            onClick={() => onFaseClick?.(fase)}
            className={clsx(
              'flex-1 relative',
              onFaseClick && 'cursor-pointer'
            )}
          >
            {/* Top section with icon and connector */}
            <div className="flex items-center">
              {/* Left connector */}
              {index > 0 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5',
                    fases[index - 1].estado === 'completada' ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2',
                  config.bgColor,
                  config.borderColor,
                  fase.estado === 'en_progreso' && 'ring-4 ring-accent/20'
                )}
              >
                <Icon className={clsx('h-5 w-5', config.color)} />
              </div>

              {/* Right connector */}
              {index < fases.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5',
                    fase.estado === 'completada' ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="mt-3 px-2 text-center">
              <h4 className={clsx(
                'text-sm font-medium',
                fase.estado === 'en_progreso' ? 'text-accent' :
                fase.estado === 'completada' ? 'text-gray-900' : 'text-gray-500'
              )}>
                {fase.nombre}
              </h4>
              {fase.estado !== 'pendiente' && (
                <div className="mt-2 px-4">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all',
                        fase.estado === 'completada' ? 'bg-green-500' :
                        fase.estado === 'bloqueada' ? 'bg-red-500' : 'bg-accent'
                      )}
                      style={{ width: `${fase.avance}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{fase.avance}%</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
