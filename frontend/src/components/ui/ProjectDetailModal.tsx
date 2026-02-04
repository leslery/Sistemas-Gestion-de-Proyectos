import { useState } from 'react';
import {
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  User,
  Users,
  FileText,
  FileSpreadsheet,
  File,
  Download,
  Activity,
  FolderKanban,
  Building2,
} from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel } from './Tabs';
import clsx from 'clsx';

interface ProjectPhase {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  startDate?: string;
  endDate?: string;
  progress?: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface ActivityItem {
  id: string;
  type: 'status_change' | 'document_added' | 'progress_update' | 'comment' | 'milestone';
  title: string;
  description?: string;
  date: string;
  user?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'other';
  size: string;
  uploadDate: string;
  uploadedBy?: string;
}

interface ProjectDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  priority: number;
  type: string;
  area: string;
  budget: number;
  budgetExecuted: number;
  currency: string;
  startDate: string;
  endDate: string;
  progress: number;
  phases: ProjectPhase[];
  team: TeamMember[];
  activities: ActivityItem[];
  documents: Document[];
}

interface ProjectDetailModalProps {
  project: ProjectDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for demo
const getMockProjectDetail = (projectId: string): ProjectDetail => ({
  id: projectId,
  code: 'PRY-2026-001',
  title: 'Modernizacion ERP SAP S/4HANA',
  description: 'Proyecto de modernizacion del sistema ERP corporativo migrando a SAP S/4HANA Cloud, incluyendo rediseno de procesos financieros, logisticos y de recursos humanos.',
  status: 'En Ejecucion',
  statusColor: 'blue',
  priority: 1,
  type: 'CAPEX Intangible',
  area: 'Tecnologia de la Informacion',
  budget: 850000,
  budgetExecuted: 510000,
  currency: 'USD',
  startDate: '2025-03-01',
  endDate: '2026-06-30',
  progress: 65,
  phases: [
    { id: '1', name: 'Planificacion', status: 'completed', startDate: '01-Mar-2025', endDate: '31-Mar-2025', progress: 100 },
    { id: '2', name: 'Analisis', status: 'completed', startDate: '01-Abr-2025', endDate: '30-Jun-2025', progress: 100 },
    { id: '3', name: 'Construccion', status: 'in-progress', startDate: '01-Jul-2025', endDate: '31-Dic-2025', progress: 60 },
    { id: '4', name: 'Pruebas', status: 'pending', startDate: '01-Ene-2026', endDate: '28-Feb-2026' },
    { id: '5', name: 'Transicion', status: 'pending', startDate: '01-Mar-2026', endDate: '30-Abr-2026' },
    { id: '6', name: 'Go Live', status: 'pending', startDate: '01-May-2026', endDate: '30-Jun-2026' },
  ],
  team: [
    { id: '1', name: 'Juan Perez', role: 'Lider de Proyecto', avatar: 'JP' },
    { id: '2', name: 'Maria Garcia', role: 'Analista Funcional', avatar: 'MG' },
    { id: '3', name: 'Carlos Lopez', role: 'Arquitecto Tecnico', avatar: 'CL' },
    { id: '4', name: 'Ana Martinez', role: 'QA Lead', avatar: 'AM' },
  ],
  activities: [
    { id: '1', type: 'status_change', title: 'Cambio de estado', description: 'Se cambio el estado a "En construccion" despues de completar la fase de analisis', date: '15-Ene-2026', user: 'Juan Perez' },
    { id: '2', type: 'document_added', title: 'Documentos agregados', description: 'Se agregaron los documentos de diseno tecnico al repositorio del proyecto', date: '10-Ene-2026', user: 'Carlos Lopez' },
    { id: '3', type: 'progress_update', title: 'Reporte de avance mensual', description: 'Se actualizo el progreso del proyecto al 65%', date: '05-Ene-2026', user: 'Juan Perez' },
    { id: '4', type: 'milestone', title: 'Comite de seguimiento', description: 'Se presento el avance al comite de inversiones con resultado favorable', date: '20-Dic-2025', user: 'Juan Perez' },
    { id: '5', type: 'comment', title: 'Levantamiento del PMO', description: 'Se identificaron riesgos en la integracion con sistemas legados', date: '15-Dic-2025', user: 'Maria Garcia' },
    { id: '6', type: 'document_added', title: 'Business Case actualizado', description: 'Se actualizo el business case con nuevas proyecciones', date: '01-Dic-2025', user: 'Ana Martinez' },
  ],
  documents: [
    { id: '1', name: 'Documentacion de Hitos', type: 'word', size: '2.4 MB', uploadDate: '15-Ene-2026', uploadedBy: 'Juan Perez' },
    { id: '2', name: 'Plan Diseno UML v1', type: 'pdf', size: '5.1 MB', uploadDate: '10-Ene-2026', uploadedBy: 'Carlos Lopez' },
    { id: '3', name: 'Business Case v2.0', type: 'excel', size: '1.8 MB', uploadDate: '01-Dic-2025', uploadedBy: 'Ana Martinez' },
    { id: '4', name: 'Arquitectura Solucion', type: 'pdf', size: '3.2 MB', uploadDate: '25-Nov-2025', uploadedBy: 'Carlos Lopez' },
    { id: '5', name: 'Cronograma Detallado', type: 'excel', size: '890 KB', uploadDate: '20-Nov-2025', uploadedBy: 'Juan Perez' },
    { id: '6', name: 'Informe Factibilidad', type: 'pdf', size: '4.5 MB', uploadDate: '15-Mar-2025', uploadedBy: 'Maria Garcia' },
    { id: '7', name: 'Presentacion Kickoff', type: 'other', size: '12 MB', uploadDate: '01-Mar-2025', uploadedBy: 'Juan Perez' },
    { id: '8', name: 'Reporte de Riesgos', type: 'excel', size: '650 KB', uploadDate: '10-Dic-2025', uploadedBy: 'Maria Garcia' },
  ],
});

const getDocIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'excel':
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    case 'word':
      return <FileText className="h-5 w-5 text-blue-600" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'status_change':
      return <Activity className="h-4 w-4 text-blue-500" />;
    case 'document_added':
      return <FileText className="h-4 w-4 text-green-500" />;
    case 'progress_update':
      return <CheckCircle className="h-4 w-4 text-cyan-500" />;
    case 'milestone':
      return <FolderKanban className="h-4 w-4 text-purple-500" />;
    case 'comment':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export default function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState('etapas');

  if (!isOpen || !project) return null;

  // Use mock data for demo (in production, this would come from API)
  const detail = getMockProjectDetail(project.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: detail.currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const budgetPercentage = Math.round((detail.budgetExecuted / detail.budget) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-light">
          <div className="text-white">
            <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                {detail.code}
              </span>
              <span>|</span>
              <span>{detail.type}</span>
            </div>
            <h2 className="text-xl font-semibold">{detail.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {detail.area}
              </span>
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                detail.statusColor === 'blue' && 'bg-blue-400/30',
                detail.statusColor === 'green' && 'bg-green-400/30',
                detail.statusColor === 'yellow' && 'bg-yellow-400/30',
                detail.statusColor === 'red' && 'bg-red-400/30',
              )}>
                {detail.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso General</span>
            <span className="font-semibold text-primary">{detail.progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
              style={{ width: `${detail.progress}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="etapas" onChange={setActiveTab}>
          <TabList className="px-5 bg-white">
            <Tab value="etapas">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Etapas del Proyecto
              </span>
            </Tab>
            <Tab value="info">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informacion General
              </span>
            </Tab>
            <Tab value="historial">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Historial
              </span>
            </Tab>
            <Tab value="documentos">
              <span className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Documentos
              </span>
            </Tab>
          </TabList>

          <div className="overflow-y-auto max-h-[calc(90vh-280px)]">
            {/* Tab: Etapas del Proyecto */}
            <TabPanel value="etapas" className="px-5">
              {/* Phase Stepper */}
              <div className="flex items-center justify-between mb-8 mt-4">
                {detail.phases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                          phase.status === 'completed' && 'bg-green-500',
                          phase.status === 'in-progress' && 'bg-blue-500',
                          phase.status === 'pending' && 'bg-gray-300'
                        )}
                      >
                        {phase.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : phase.status === 'in-progress' ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={clsx(
                        'text-xs mt-2 font-medium',
                        phase.status === 'completed' && 'text-green-600',
                        phase.status === 'in-progress' && 'text-blue-600',
                        phase.status === 'pending' && 'text-gray-400'
                      )}>
                        {phase.name}
                      </span>
                    </div>
                    {index < detail.phases.length - 1 && (
                      <div
                        className={clsx(
                          'w-12 h-1 mx-2',
                          phase.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Phase Details */}
              <div className="space-y-3">
                {detail.phases.map((phase) => (
                  <div
                    key={phase.id}
                    className={clsx(
                      'flex items-center justify-between p-4 rounded-lg border',
                      phase.status === 'completed' && 'bg-green-50 border-green-200',
                      phase.status === 'in-progress' && 'bg-blue-50 border-blue-200',
                      phase.status === 'pending' && 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          phase.status === 'completed' && 'bg-green-500 text-white',
                          phase.status === 'in-progress' && 'bg-blue-500 text-white',
                          phase.status === 'pending' && 'bg-gray-300 text-gray-600'
                        )}
                      >
                        {phase.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{phase.name}</p>
                        <p className="text-sm text-gray-500">
                          {phase.startDate} - {phase.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {phase.status === 'in-progress' && phase.progress !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-blue-600">{phase.progress}%</span>
                        </div>
                      )}
                      <span
                        className={clsx(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          phase.status === 'completed' && 'bg-green-100 text-green-700',
                          phase.status === 'in-progress' && 'bg-blue-100 text-blue-700',
                          phase.status === 'pending' && 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {phase.status === 'completed' ? 'Completado' :
                         phase.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabPanel>

            {/* Tab: Informacion General */}
            <TabPanel value="info" className="px-5">
              <div className="grid grid-cols-2 gap-6 mt-4">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* General Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Informacion General
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Codigo</p>
                        <p className="font-medium">{detail.code}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tipo</p>
                        <p className="font-medium">{detail.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Descripcion</p>
                        <p className="text-sm text-gray-700">{detail.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Informacion Financiera
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Presupuesto Total</span>
                        <span className="font-semibold text-lg text-primary">{formatCurrency(detail.budget)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ejecutado</span>
                        <span className="font-medium text-green-600">{formatCurrency(detail.budgetExecuted)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Disponible</span>
                        <span className="font-medium text-gray-700">{formatCurrency(detail.budget - detail.budgetExecuted)}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Ejecucion</span>
                          <span className="font-medium">{budgetPercentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${budgetPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Team */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Responsables
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {detail.team.map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Dates */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fechas Clave
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Inicio</span>
                        <span className="font-medium">{new Date(detail.startDate).toLocaleDateString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fin Planificado</span>
                        <span className="font-medium">{new Date(detail.endDate).toLocaleDateString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Duracion</span>
                        <span className="font-medium">16 meses</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Tab: Historial de Actividades */}
            <TabPanel value="historial" className="px-5">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Todas las Acciones
                  </h3>
                  <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent">
                    <option>Todos los tipos</option>
                    <option>Cambios de estado</option>
                    <option>Documentos</option>
                    <option>Reportes</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {detail.activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        {index < detail.activities.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{activity.title}</p>
                            {activity.description && (
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            )}
                            {activity.user && (
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activity.user}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {activity.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabPanel>

            {/* Tab: Documentos Adjuntos */}
            <TabPanel value="documentos" className="px-5">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {detail.documents.length} Documentos
                  </h3>
                  <button className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1">
                    + Subir Documento
                  </button>
                </div>
                <div className="space-y-2">
                  {detail.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {getDocIcon(doc.type)}
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-400">
                            {doc.size} • {doc.uploadDate} • {doc.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabPanel>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ver Proyecto
          </button>
        </div>
      </div>
    </div>
  );
}
