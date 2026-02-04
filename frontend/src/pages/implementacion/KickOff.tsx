import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  Search,
  Filter,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  ChevronRight,
  Play,
  X,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { FaseTimeline, Fase } from '../../components/workflow/FaseTimeline';
import { useToast } from '../../components/ui/Toast';

interface ProyectoKickOff {
  id: number;
  codigo: string;
  nombre: string;
  area: string;
  responsable: string;
  fechaActivacion: string;
  kickOffRealizado: boolean;
  fechaKickOff?: string;
  participantes?: number;
}

const proyectos: ProyectoKickOff[] = [
  { id: 1, codigo: 'PRY-001', nombre: 'Modernización ERP', area: 'TI', responsable: 'Juan Pérez', fechaActivacion: '2024-02-01', kickOffRealizado: false },
  { id: 2, codigo: 'PRY-002', nombre: 'Portal Autoatención', area: 'Comercial', responsable: 'María García', fechaActivacion: '2024-01-25', kickOffRealizado: true, fechaKickOff: '2024-02-05', participantes: 12 },
  { id: 3, codigo: 'PRY-003', nombre: 'Sistema CRM', area: 'Comercial', responsable: 'Carlos López', fechaActivacion: '2024-02-10', kickOffRealizado: false },
];

export default function KickOff() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendiente' | 'realizado'>('all');
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoKickOff | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [kickOffForm, setKickOffForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: '10:00',
    participantes: '',
    objetivos: '',
    ubicacion: 'Sala de Reuniones Principal',
  });

  const handleIniciarKickOff = (proyecto: ProyectoKickOff) => {
    setSelectedProyecto(proyecto);
    setShowModal(true);
  };

  const handleConfirmarKickOff = () => {
    if (!kickOffForm.fecha || !kickOffForm.hora) {
      showToast('Por favor complete los campos requeridos', 'error');
      return;
    }
    showToast(`Kick-Off programado para ${selectedProyecto?.nombre}`, 'success');
    setShowModal(false);
    setSelectedProyecto(null);
    setKickOffForm({
      fecha: new Date().toISOString().split('T')[0],
      hora: '10:00',
      participantes: '',
      objetivos: '',
      ubicacion: 'Sala de Reuniones Principal',
    });
  };

  const filteredProyectos = proyectos.filter((p) => {
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) && !p.codigo.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus === 'pendiente' && p.kickOffRealizado) return false;
    if (filterStatus === 'realizado' && !p.kickOffRealizado) return false;
    return true;
  });

  const fases: Fase[] = [
    { id: '1', nombre: 'Kick-Off', avance: 100, estado: 'completada' },
    { id: '2', nombre: 'Análisis', avance: 0, estado: 'pendiente' },
    { id: '3', nombre: 'Construcción', avance: 0, estado: 'pendiente' },
    { id: '4', nombre: 'Pruebas', avance: 0, estado: 'pendiente' },
    { id: '5', nombre: 'Transición', avance: 0, estado: 'pendiente' },
    { id: '6', nombre: 'Go-Live', avance: 0, estado: 'pendiente' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="h-7 w-7 text-accent" />
            Kick-Off de Proyectos
          </h1>
          <p className="text-gray-500 mt-1">Gestión de reuniones de inicio de proyectos</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Kick-Off Pendientes"
          value={proyectos.filter((p) => !p.kickOffRealizado).length}
          icon={Clock}
          color="warning"
        />
        <KPICard
          title="Kick-Off Realizados"
          value={proyectos.filter((p) => p.kickOffRealizado).length}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Proyectos Activos"
          value={proyectos.length}
          icon={Rocket}
          color="primary"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyecto..."
            className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos</option>
          <option value="pendiente">Pendiente Kick-Off</option>
          <option value="realizado">Kick-Off Realizado</option>
        </select>
      </div>

      {/* Project List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProyectos.map((proyecto) => (
          <div
            key={proyecto.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  proyecto.kickOffRealizado ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {proyecto.kickOffRealizado ? <CheckCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                </div>
                <div>
                  <span className="text-xs font-medium text-accent">{proyecto.codigo}</span>
                  <h3 className="text-base font-semibold text-gray-900 mt-0.5">{proyecto.nombre}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{proyecto.area}</span>
                    <span>·</span>
                    <span>{proyecto.responsable}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {proyecto.kickOffRealizado ? (
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Realizado
                  </span>
                ) : (
                  <button
                    onClick={() => handleIniciarKickOff(proyecto)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar Kick-Off
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Activación</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(proyecto.fechaActivacion).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>
              {proyecto.fechaKickOff && (
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Kick-Off</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(proyecto.fechaKickOff).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              )}
              {proyecto.participantes && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Participantes</p>
                    <p className="text-sm font-medium text-gray-900">{proyecto.participantes}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Acta</p>
                  <p className="text-sm font-medium text-gray-900">
                    {proyecto.kickOffRealizado ? 'Disponible' : 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>

            {proyecto.kickOffRealizado && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Progreso del Proyecto</p>
                <FaseTimeline fases={fases} orientation="horizontal" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Kick-Off */}
      {showModal && selectedProyecto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Programar Kick-Off</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedProyecto.codigo} - {selectedProyecto.nombre}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={kickOffForm.fecha}
                    onChange={(e) => setKickOffForm({ ...kickOffForm, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={kickOffForm.hora}
                    onChange={(e) => setKickOffForm({ ...kickOffForm, hora: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={kickOffForm.ubicacion}
                  onChange={(e) => setKickOffForm({ ...kickOffForm, ubicacion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                  placeholder="Sala de reuniones o link de videollamada"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participantes (emails separados por coma)
                </label>
                <input
                  type="text"
                  value={kickOffForm.participantes}
                  onChange={(e) => setKickOffForm({ ...kickOffForm, participantes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                  placeholder="correo1@empresa.cl, correo2@empresa.cl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objetivos de la reunión
                </label>
                <textarea
                  value={kickOffForm.objetivos}
                  onChange={(e) => setKickOffForm({ ...kickOffForm, objetivos: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent resize-none"
                  placeholder="Describa los objetivos principales del kick-off..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarKickOff}
                className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" />
                Programar Kick-Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
