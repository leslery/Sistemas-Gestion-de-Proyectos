import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export default function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size]
      )}
    >
      {children}
    </span>
  );
}

// Badge para estados de iniciativa
export function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    borrador: { variant: 'default', label: 'Borrador' },
    enviada: { variant: 'info', label: 'Enviada' },
    en_revision: { variant: 'warning', label: 'En Revisión' },
    en_evaluacion: { variant: 'primary', label: 'En Evaluación' },
    aprobada: { variant: 'success', label: 'Aprobada' },
    rechazada: { variant: 'danger', label: 'Rechazada' },
    en_banco_reserva: { variant: 'info', label: 'Banco Reserva' },
    en_plan_anual: { variant: 'primary', label: 'Plan Anual' },
    activada: { variant: 'success', label: 'Activada' },
  };

  const { variant, label } = config[estado] || { variant: 'default', label: estado };

  return <Badge variant={variant}>{label}</Badge>;
}

// Badge para prioridad
export function PrioridadBadge({ prioridad }: { prioridad: string }) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    P1: { variant: 'danger', label: 'P1 - Muy Alta' },
    P2: { variant: 'warning', label: 'P2 - Alta' },
    P3: { variant: 'primary', label: 'P3 - Media' },
    P4: { variant: 'info', label: 'P4 - Baja' },
    P5: { variant: 'default', label: 'P5 - Muy Baja' },
  };

  const { variant, label } = config[prioridad] || { variant: 'default', label: prioridad };

  return <Badge variant={variant}>{label}</Badge>;
}

// Badge para semáforo
export function SemaforoBadge({ semaforo }: { semaforo: string }) {
  const config: Record<string, { color: string; label: string }> = {
    verde: { color: 'bg-green-500', label: 'En Control' },
    amarillo: { color: 'bg-yellow-500', label: 'En Riesgo' },
    rojo: { color: 'bg-red-500', label: 'Crítico' },
  };

  const { color, label } = config[semaforo] || { color: 'bg-gray-500', label: semaforo };

  return (
    <span className="inline-flex items-center">
      <span className={clsx('h-3 w-3 rounded-full mr-2', color)}></span>
      <span className="text-sm text-gray-700">{label}</span>
    </span>
  );
}
