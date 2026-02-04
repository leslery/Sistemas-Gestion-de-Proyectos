import { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  FileText,
  BookOpen,
  Server,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { Timeline } from '../../components/ui/Timeline';

interface ActividadTransicion {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'completada' | 'en_progreso' | 'pendiente';
  responsable: string;
  fechaLimite: string;
}

interface ProyectoTransicion {
  id: number;
  codigo: string;
  nombre: string;
  avanceTransicion: number;
  actividades: ActividadTransicion[];
  checklistDespliegue: { item: string; completado: boolean }[];
}

const proyectos: ProyectoTransicion[] = [
  {
    id: 1,
    codigo: 'PRY-001',
    nombre: 'Modernización ERP',
    avanceTransicion: 60,
    actividades: [
      { id: '1', nombre: 'Documentación técnica', descripcion: 'Manuales de operación y mantenimiento', estado: 'completada', responsable: 'Carlos López', fechaLimite: '2024-02-10' },
      { id: '2', nombre: 'Capacitación usuarios clave', descripcion: 'Training a usuarios power', estado: 'completada', responsable: 'María García', fechaLimite: '2024-02-15' },
      { id: '3', nombre: 'Migración de datos', descripcion: 'Carga de datos históricos', estado: 'en_progreso', responsable: 'Juan Pérez', fechaLimite: '2024-02-20' },
      { id: '4', nombre: 'Configuración ambientes', descripcion: 'Setup de producción', estado: 'pendiente', responsable: 'Carlos López', fechaLimite: '2024-02-25' },
      { id: '5', nombre: 'Capacitación masiva', descripcion: 'Training a todos los usuarios', estado: 'pendiente', responsable: 'María García', fechaLimite: '2024-03-01' },
    ],
    checklistDespliegue: [
      { item: 'Ambientes de producción configurados', completado: false },
      { item: 'Base de datos migrada y validada', completado: false },
      { item: 'Integraciones verificadas', completado: false },
      { item: 'Plan de rollback documentado', completado: true },
      { item: 'Equipo de soporte capacitado', completado: true },
      { item: 'Comunicación a usuarios enviada', completado: false },
    ],
  },
];

export default function Transicion() {
  const [selectedProyecto] = useState<ProyectoTransicion>(proyectos[0]);

  const timelineItems = selectedProyecto.actividades.map((act) => ({
    id: act.id,
    title: act.nombre,
    description: `${act.responsable} • ${new Date(act.fechaLimite).toLocaleDateString('es-CL')}`,
    status: act.estado === 'completada' ? 'completed' as const :
            act.estado === 'en_progreso' ? 'current' as const : 'pending' as const,
  }));

  const completadas = selectedProyecto.actividades.filter((a) => a.estado === 'completada').length;
  const checklistCompletado = selectedProyecto.checklistDespliegue.filter((c) => c.completado).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowRightLeft className="h-7 w-7 text-accent" />
            Transición
          </h1>
          <p className="text-gray-500 mt-1">Preparación para despliegue a producción</p>
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-medium text-accent">{selectedProyecto.codigo}</span>
            <h2 className="text-xl font-semibold text-gray-900 mt-1">{selectedProyecto.nombre}</h2>
          </div>
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
            En Transición
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Avance de Transición</span>
            <span className="text-sm font-medium">{selectedProyecto.avanceTransicion}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${selectedProyecto.avanceTransicion}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Actividades Completadas"
          value={`${completadas}/${selectedProyecto.actividades.length}`}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Checklist Despliegue"
          value={`${checklistCompletado}/${selectedProyecto.checklistDespliegue.length}`}
          icon={FileText}
          color={checklistCompletado === selectedProyecto.checklistDespliegue.length ? 'success' : 'warning'}
        />
        <KPICard
          title="Documentos"
          value="12"
          icon={BookOpen}
          color="primary"
        />
        <KPICard
          title="Usuarios Capacitados"
          value="45"
          icon={Users}
          color="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades de Transición</h3>
          <Timeline items={timelineItems} />
        </div>

        {/* Deployment Checklist */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklist de Despliegue</h3>
          <div className="space-y-3">
            {selectedProyecto.checklistDespliegue.map((item, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.completado}
                  onChange={() => {}}
                  className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent"
                />
                <span className={`text-sm ${item.completado ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                  {item.item}
                </span>
                {item.completado && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Deployment Readiness */}
      <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border border-accent/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Server className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Estado de Preparación para Go-Live</h3>
            <p className="text-sm text-gray-600 mt-1">
              {checklistCompletado === selectedProyecto.checklistDespliegue.length
                ? 'Todos los requisitos de despliegue están completados. El proyecto está listo para Go-Live.'
                : `Faltan ${selectedProyecto.checklistDespliegue.length - checklistCompletado} items del checklist para completar la transición.`}
            </p>
            <div className="flex items-center gap-4 mt-4">
              {checklistCompletado === selectedProyecto.checklistDespliegue.length ? (
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <CheckCircle className="h-4 w-4" />
                  Proceder a Go-Live
                </button>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">Transición en progreso</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Contacts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipo de Transición</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { nombre: 'Juan Pérez', rol: 'Líder de Proyecto', contacto: 'jperez@cge.cl' },
            { nombre: 'María García', rol: 'Capacitación', contacto: 'mgarcia@cge.cl' },
            { nombre: 'Carlos López', rol: 'Infraestructura', contacto: 'clopez@cge.cl' },
          ].map((miembro) => (
            <div key={miembro.nombre} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-medium">
                {miembro.nombre.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{miembro.nombre}</p>
                <p className="text-xs text-gray-500">{miembro.rol}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
