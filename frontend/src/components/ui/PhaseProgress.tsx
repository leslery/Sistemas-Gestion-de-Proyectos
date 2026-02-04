export interface Phase {
  id: string;
  label: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface PhaseProgressProps {
  phases: Phase[];
}

const statusStyles = {
  completed: {
    barColor: '#38a169',
    barWidth: '100%',
    labelColor: '#38a169',
    labelWeight: 400,
  },
  'in-progress': {
    barColor: '#3182ce',
    barWidth: '60%',
    labelColor: '#3182ce',
    labelWeight: 500,
  },
  pending: {
    barColor: '#cbd5e0',
    barWidth: '0%',
    labelColor: '#718096',
    labelWeight: 400,
  },
};

export default function PhaseProgress({ phases }: PhaseProgressProps) {
  return (
    <div className="flex gap-2 mt-4">
      {phases.map((phase) => {
        const style = statusStyles[phase.status];

        return (
          <div key={phase.id} className="flex-1 text-center">
            {/* Progress bar */}
            <div
              className="h-1.5 rounded-full mb-2 overflow-hidden"
              style={{ background: '#e2e8f0' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  background: style.barColor,
                  width: style.barWidth,
                }}
              />
            </div>
            {/* Label */}
            <div
              className="text-xs whitespace-nowrap"
              style={{
                color: style.labelColor,
                fontWeight: style.labelWeight,
              }}
            >
              {phase.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Default phases for projects
export const defaultPhases: Phase[] = [
  { id: 'planning', label: 'Planificación', status: 'completed' },
  { id: 'analysis', label: 'Análisis', status: 'completed' },
  { id: 'construction', label: 'Construcción', status: 'in-progress' },
  { id: 'testing', label: 'Pruebas', status: 'pending' },
  { id: 'transition', label: 'Transición', status: 'pending' },
  { id: 'golive', label: 'Go Live', status: 'pending' },
];
