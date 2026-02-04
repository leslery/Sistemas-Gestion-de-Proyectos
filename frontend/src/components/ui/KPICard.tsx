import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

type TrendDirection = 'up' | 'down' | 'neutral';
type ColorVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: TrendDirection;
    label?: string;
  };
  color?: ColorVariant;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

const colorClasses: Record<ColorVariant, { bg: string; icon: string; border: string }> = {
  default: {
    bg: 'bg-gray-50',
    icon: 'bg-gray-100 text-gray-600',
    border: 'border-gray-200',
  },
  primary: {
    bg: 'bg-accent/5',
    icon: 'bg-accent/15 text-accent',
    border: 'border-accent/20',
  },
  success: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    border: 'border-green-200',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    border: 'border-amber-200',
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    border: 'border-red-200',
  },
};

const trendColors: Record<TrendDirection, string> = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
};

const TrendIcon: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'default',
  className,
  onClick,
  children,
}: KPICardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={clsx(
        'rounded-xl border p-5 transition-all',
        colors.bg,
        colors.border,
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-3">
          {(() => {
            const TrendIconComponent = TrendIcon[trend.direction];
            return (
              <TrendIconComponent
                className={clsx('h-4 w-4', trendColors[trend.direction])}
              />
            );
          })()}
          <span className={clsx('text-sm font-medium', trendColors[trend.direction])}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          {trend.label && (
            <span className="text-xs text-gray-500">{trend.label}</span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

// Variant for mini KPI display
interface MiniKPIProps {
  label: string;
  value: string | number;
  color?: 'green' | 'yellow' | 'red' | 'gray';
}

export function MiniKPI({ label, value, color = 'gray' }: MiniKPIProps) {
  const dotColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-2 h-2 rounded-full', dotColors[color])} />
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
