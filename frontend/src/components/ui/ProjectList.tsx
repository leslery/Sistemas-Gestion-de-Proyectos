import clsx from 'clsx';
import { Project } from '../../data/mockData';

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  showMeta?: boolean;
}

const priorityColors: Record<number, string> = {
  1: '#e53e3e', // P1 - Red
  2: '#ed8936', // P2 - Orange
  3: '#d69e2e', // P3 - Yellow
  4: '#38a169', // P4 - Green
  5: '#a0aec0', // P5 - Gray
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  'en-ejecucion': { bg: 'rgba(56, 161, 105, 0.15)', color: '#38a169' },
  'en-revision': { bg: 'rgba(214, 158, 46, 0.15)', color: '#d69e2e' },
  'en-riesgo': { bg: 'rgba(229, 62, 62, 0.15)', color: '#e53e3e' },
  'pendiente': { bg: 'rgba(49, 130, 206, 0.15)', color: '#3182ce' },
  'evaluacion': { bg: 'rgba(49, 130, 206, 0.15)', color: '#3182ce' },
  'factibilidad': { bg: 'rgba(159, 122, 234, 0.15)', color: '#9f7aea' },
  'activacion': { bg: 'rgba(0, 181, 216, 0.15)', color: '#00b5d8' },
};

export default function ProjectList({ projects, onProjectClick, showMeta = true }: ProjectListProps) {
  return (
    <div className="flex flex-col gap-3">
      {projects.map((project) => {
        const statusStyle = statusStyles[project.status] || statusStyles['pendiente'];

        return (
          <div
            key={project.id}
            onClick={() => onProjectClick?.(project)}
            className={clsx(
              'flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300',
              'border-l-4 border-transparent',
              'hover:bg-gray-100 hover:border-l-blue-500'
            )}
            style={{ background: '#f7fafc' }}
          >
            {/* Priority indicator */}
            <div
              className="w-2.5 h-2.5 rounded-full mr-4 flex-shrink-0"
              style={{ background: priorityColors[project.priority] }}
              title={`Prioridad ${project.priority}`}
            />

            {/* Project info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 truncate">{project.title}</div>
              {showMeta && (
                <div className="text-sm text-gray-500 mt-0.5">
                  {project.type && project.amount && project.phase ? (
                    <>
                      {project.type} · {project.amount} · Fase: {project.phase}
                    </>
                  ) : project.waitingFor ? (
                    <>
                      Esperando: {project.waitingFor} · {project.waitingDays} días
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Status badge */}
            <span
              className="px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 ml-3"
              style={{
                background: statusStyle.bg,
                color: statusStyle.color,
              }}
            >
              {project.statusLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
