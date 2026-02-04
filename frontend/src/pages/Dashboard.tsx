import { Link } from 'react-router-dom';
import {
  dashboardStats,
  projectsInExecution,
  pendingApprovals,
  quickActions,
  upcomingSessions,
  projectPhases,
  Project,
  QuickAction,
} from '../data/mockData';
import StatCard from '../components/ui/StatCard';
import ProjectList from '../components/ui/ProjectList';
import { QuickActionsSimple } from '../components/ui/QuickActions';
import PhaseProgress, { Phase } from '../components/ui/PhaseProgress';
import { useToast } from '../components/ui/Toast';

export default function Dashboard() {
  const { showToast } = useToast();

  const handleProjectClick = (project: Project) => {
    showToast(`Abriendo proyecto: ${project.title}`, 'info');
  };

  const handleQuickActionClick = (action: QuickAction) => {
    showToast(`Abriendo: ${action.label}`, 'info');
  };

  const phases: Phase[] = projectPhases.map(p => ({
    id: p.id,
    label: p.label,
    status: p.status as 'completed' | 'in-progress' | 'pending'
  }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 text-sm text-gray-500">
        <Link to="/" className="hover:underline" style={{ color: '#3182ce' }}>Inicio</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span>Dashboard</span>
        <i className="fas fa-chevron-right text-xs"></i>
        <span>Vista Ejecutiva</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Vista Ejecutiva</h1>
          <p className="text-gray-500 mt-1">Resumen del portafolio de proyectos e iniciativas</p>
        </div>
        <div className="flex gap-2.5">
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <i className="fas fa-download"></i>
            Exportar
          </button>
          <Link
            to="/iniciativas/nueva"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border-none text-white hover:translate-y-[-1px]"
            style={{ background: '#3182ce', boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)' }}
          >
            <i className="fas fa-plus"></i>
            Nueva Iniciativa
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            icon={stat.icon}
            color={stat.color}
            value={stat.value}
            label={stat.label}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Proyectos en Ejecución */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5 text-lg font-semibold text-gray-800">
              <i className="fas fa-play-circle" style={{ color: '#3182ce' }}></i>
              Proyectos en Ejecución
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-md bg-gray-100 border-none cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors" title="Filtrar">
                <i className="fas fa-filter text-sm"></i>
              </button>
              <button className="w-8 h-8 rounded-md bg-gray-100 border-none cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors" title="Ver todo">
                <i className="fas fa-external-link-alt text-sm"></i>
              </button>
            </div>
          </div>
          <div className="p-5">
            <ProjectList
              projects={projectsInExecution}
              onProjectClick={handleProjectClick}
            />
            <PhaseProgress phases={phases} />
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5 p-5 border-b border-gray-100">
            <i className="fas fa-bolt text-lg" style={{ color: '#3182ce' }}></i>
            <span className="text-lg font-semibold text-gray-800">Acciones Rápidas</span>
          </div>
          <div className="p-5">
            <QuickActionsSimple
              actions={quickActions}
              onActionClick={handleQuickActionClick}
            />
          </div>
        </div>

        {/* Pendientes de Aprobación */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5 text-lg font-semibold text-gray-800">
              <i className="fas fa-clock" style={{ color: '#3182ce' }}></i>
              Pendientes de Aprobación
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-md bg-gray-100 border-none cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors" title="Ver todo">
                <i className="fas fa-external-link-alt text-sm"></i>
              </button>
            </div>
          </div>
          <div className="p-5">
            <ProjectList
              projects={pendingApprovals}
              onProjectClick={handleProjectClick}
            />
          </div>
        </div>

        {/* Próximas Sesiones */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5 text-lg font-semibold text-gray-800">
              <i className="fas fa-calendar" style={{ color: '#3182ce' }}></i>
              Próximas Sesiones
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-md bg-gray-100 border-none cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors" title="Ver calendario">
                <i className="fas fa-calendar-alt text-sm"></i>
              </button>
            </div>
          </div>
          <div className="p-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Proyectos</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td>
                      <strong>{session.date}</strong>
                      <br />
                      <small className="text-gray-400">{session.time}</small>
                    </td>
                    <td>{session.type}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        {session.projectCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <p>Sistema de Gestión de Iniciativas y Proyectos v1.0 · CGE Chile · 2026</p>
        <p>Desarrollado conforme a PE.06515.CL.Dx y PE.CGEDx</p>
      </footer>
    </div>
  );
}
