import clsx from 'clsx';

export interface StatCardProps {
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';
  value: string | number;
  label: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  onClick?: () => void;
}

const colorStyles: Record<string, { bg: string; color: string }> = {
  blue: { bg: 'rgba(49, 130, 206, 0.15)', color: '#3182ce' },
  green: { bg: 'rgba(56, 161, 105, 0.15)', color: '#38a169' },
  yellow: { bg: 'rgba(214, 158, 46, 0.15)', color: '#d69e2e' },
  red: { bg: 'rgba(229, 62, 62, 0.15)', color: '#e53e3e' },
  purple: { bg: 'rgba(159, 122, 234, 0.15)', color: '#9f7aea' },
  cyan: { bg: 'rgba(0, 181, 216, 0.15)', color: '#00b5d8' },
};

export default function StatCard({ icon, color, value, label, trend, onClick }: StatCardProps) {
  const style = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl p-5 flex items-center gap-4 transition-all duration-300',
        'hover:translate-y-[-3px] hover:shadow-lg cursor-pointer'
      )}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: style.bg, color: style.color }}
      >
        <i className={`fas ${icon}`}></i>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-3xl font-semibold text-gray-800 leading-none">{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>

      {/* Trend */}
      {trend && (
        <div className="text-right ml-auto">
          <div
            className={clsx(
              'text-sm font-medium flex items-center justify-end',
              trend.direction === 'up' && 'text-green-600',
              trend.direction === 'down' && 'text-red-600',
              trend.direction === 'neutral' && 'text-gray-600'
            )}
          >
            {trend.direction === 'up' && <i className="fas fa-arrow-up mr-1"></i>}
            {trend.direction === 'down' && <i className="fas fa-arrow-down mr-1"></i>}
            {trend.value}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{trend.label}</div>
        </div>
      )}
    </div>
  );
}
