import { ReactNode } from 'react';
import { Check, Clock, AlertCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

export type TimelineItemStatus = 'completed' | 'current' | 'pending' | 'error';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status: TimelineItemStatus;
  icon?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

const statusIcons: Record<TimelineItemStatus, ReactNode> = {
  completed: <Check className="h-4 w-4" />,
  current: <Clock className="h-4 w-4" />,
  pending: <Circle className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
};

const statusColors: Record<TimelineItemStatus, string> = {
  completed: 'bg-green-500 text-white',
  current: 'bg-accent text-white ring-4 ring-accent/20',
  pending: 'bg-gray-200 text-gray-500',
  error: 'bg-red-500 text-white',
};

const statusLineColors: Record<TimelineItemStatus, string> = {
  completed: 'bg-green-500',
  current: 'bg-accent',
  pending: 'bg-gray-200',
  error: 'bg-red-500',
};

export function Timeline({ items, orientation = 'vertical', className }: TimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={clsx('flex items-start', className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex-1 relative">
            <div className="flex items-center">
              {/* Line before */}
              {index > 0 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5',
                    statusLineColors[items[index - 1].status]
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                  statusColors[item.status]
                )}
              >
                {item.icon || statusIcons[item.status]}
              </div>

              {/* Line after */}
              {index < items.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5',
                    statusLineColors[item.status]
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="mt-2 text-center px-2">
              <p className={clsx(
                'text-sm font-medium',
                item.status === 'current' ? 'text-accent' :
                item.status === 'completed' ? 'text-gray-900' : 'text-gray-500'
              )}>
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              )}
              {item.date && (
                <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('relative', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4 pb-6 last:pb-0">
          {/* Icon and line */}
          <div className="flex flex-col items-center">
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                statusColors[item.status]
              )}
            >
              {item.icon || statusIcons[item.status]}
            </div>
            {index < items.length - 1 && (
              <div
                className={clsx(
                  'w-0.5 flex-1 mt-2',
                  statusLineColors[item.status]
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2">
              <p className={clsx(
                'text-sm font-medium',
                item.status === 'current' ? 'text-accent' :
                item.status === 'completed' ? 'text-gray-900' : 'text-gray-500'
              )}>
                {item.title}
              </p>
              {item.date && (
                <span className="text-xs text-gray-400">{item.date}</span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
