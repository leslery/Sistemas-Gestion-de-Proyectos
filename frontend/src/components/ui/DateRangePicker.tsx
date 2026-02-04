import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Seleccionar rango de fechas',
  className,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(new Date(year, month, -firstDay.getDay() + i + 1));
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Fill remaining days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const handleDayClick = (date: Date) => {
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;

    if (selecting === 'start') {
      onChange({ start: date, end: null });
      setSelecting('end');
    } else {
      if (value.start && date < value.start) {
        onChange({ start: date, end: value.start });
      } else {
        onChange({ start: value.start, end: date });
      }
      setSelecting('start');
      setIsOpen(false);
    }
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const clear = () => {
    onChange({ start: null, end: null });
    setSelecting('start');
  };

  const days = getDaysInMonth(viewDate);
  const currentMonth = viewDate.getMonth();

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg text-left text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
      >
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className={clsx(
          'flex-1',
          value.start ? 'text-gray-900' : 'text-gray-500'
        )}>
          {value.start && value.end
            ? `${formatDate(value.start)} - ${formatDate(value.end)}`
            : value.start
            ? `${formatDate(value.start)} - ...`
            : placeholder}
        </span>
        {(value.start || value.end) && (
          <X
            className="h-4 w-4 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
          />
        )}
      </button>

      {/* Calendar dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isSelected =
                (value.start && isSameDay(date, value.start)) ||
                (value.end && isSameDay(date, value.end));
              const isRangeDay = isInRange(date, value.start, value.end);
              const isDisabled =
                (minDate && date < minDate) || (maxDate && date > maxDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={index}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(date)}
                  className={clsx(
                    'h-8 w-8 text-sm rounded-lg transition-colors',
                    !isCurrentMonth && 'text-gray-300',
                    isCurrentMonth && !isSelected && !isRangeDay && 'text-gray-700 hover:bg-gray-100',
                    isSelected && 'bg-accent text-white',
                    isRangeDay && !isSelected && 'bg-accent/10 text-accent',
                    isDisabled && 'opacity-50 cursor-not-allowed',
                    isToday && !isSelected && 'ring-1 ring-accent'
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick selections */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                onChange({ start: weekAgo, end: today });
                setIsOpen(false);
              }}
              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
            >
              Última semana
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                onChange({ start: monthAgo, end: today });
                setIsOpen(false);
              }}
              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
            >
              Último mes
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const yearStart = new Date(today.getFullYear(), 0, 1);
                onChange({ start: yearStart, end: today });
                setIsOpen(false);
              }}
              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
            >
              Este año
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
