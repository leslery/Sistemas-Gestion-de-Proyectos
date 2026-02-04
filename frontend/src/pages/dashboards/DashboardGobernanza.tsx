import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  RefreshCw,
  ChevronRight,
  FileText,
  Gavel,
  Timer,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { Timeline } from '../../components/ui/Timeline';

interface GobernanzaData {
  comites: {
    programados: number;
    realizados: number;
    pendientes: number;
  };
  aprobaciones: {
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    tiempoPromedio: number;
  };
  slas: {
    nombre: string;
    cumplimiento: number;
    objetivo: number;
    estado: 'verde' | 'amarillo' | 'rojo';
  }[];
  proximosComites: {
    id: number;
    nombre: string;
    fecha: string;
    tipo: string;
    participantes: number;
    temas: number;
  }[];
  actividadReciente: {
    id: string;
    titulo: string;
    descripcion: string;
    fecha: string;
    tipo: 'aprobacion' | 'rechazo' | 'comite' | 'escalamiento';
  }[];
}

export default function DashboardGobernanza() {
  const [data, setData] = useState<GobernanzaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // API call would go here
      // For now, using mock data
      setData({
        comites: {
          programados: 24,
          realizados: 18,
          pendientes: 6,
        },
        aprobaciones: {
          pendientes: 8,
          aprobadas: 45,
          rechazadas: 7,
          tiempoPromedio: 3.5,
        },
        slas: [
          { nombre: 'Revisión Técnica', cumplimiento: 95, objetivo: 90, estado: 'verde' },
          { nombre: 'Aprobación Comité', cumplimiento: 88, objetivo: 85, estado: 'verde' },
          { nombre: 'Activación Proyecto', cumplimiento: 72, objetivo: 80, estado: 'amarillo' },
          { nombre: 'Resolución Issues', cumplimiento: 65, objetivo: 75, estado: 'rojo' },
        ],
        proximosComites: [
          { id: 1, nombre: 'Comité de Expertos', fecha: '2024-02-15', tipo: 'Evaluación', participantes: 5, temas: 3 },
          { id: 2, nombre: 'Comité Ejecutivo', fecha: '2024-02-20', tipo: 'Aprobación', participantes: 8, temas: 5 },
          { id: 3, nombre: 'Comité Técnico', fecha: '2024-02-22', tipo: 'Revisión', participantes: 4, temas: 2 },
        ],
        actividadReciente: [
          { id: '1', titulo: 'Iniciativa ERP aprobada', descripcion: 'El comité aprobó la iniciativa de modernización ERP', fecha: '2024-02-10', tipo: 'aprobacion' },
          { id: '2', titulo: 'Comité Técnico realizado', descripcion: 'Se revisaron 3 propuestas técnicas', fecha: '2024-02-08', tipo: 'comite' },
          { id: '3', titulo: 'Escalamiento presupuestario', descripcion: 'Proyecto Cloud requiere aumento de presupuesto', fecha: '2024-02-07', tipo: 'escalamiento' },
          { id: '4', titulo: 'Iniciativa rechazada', descripcion: 'Portal B2B no cumplió criterios mínimos', fecha: '2024-02-05', tipo: 'rechazo' },
        ],
      });
    } catch (error) {
      console.error('Error fetching gobernanza data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const timelineItems = data?.actividadReciente.map((item) => ({
    id: item.id,
    title: item.titulo,
    description: item.descripcion,
    date: new Date(item.fecha).toLocaleDateString('es-CL'),
    status: item.tipo === 'aprobacion' ? 'completed' as const :
            item.tipo === 'rechazo' ? 'error' as const :
            item.tipo === 'escalamiento' ? 'current' as const : 'pending' as const,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-accent" />
            Dashboard de Gobernanza
          </h1>
          <p className="text-gray-500 mt-1">Comités, aprobaciones y cumplimiento de SLAs</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors self-end"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Aprobaciones Pendientes"
          value={data?.aprobaciones.pendientes || 0}
          icon={Clock}
          color="warning"
          subtitle="Requieren atención"
        />
        <KPICard
          title="Comités Realizados"
          value={`${data?.comites.realizados}/${data?.comites.programados}`}
          icon={Gavel}
          color="success"
          subtitle={`${data?.comites.pendientes} pendientes`}
        />
        <KPICard
          title="Tasa de Aprobación"
          value={`${data ? Math.round((data.aprobaciones.aprobadas / (data.aprobaciones.aprobadas + data.aprobaciones.rechazadas)) * 100) : 0}%`}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title="Tiempo Promedio"
          value={`${data?.aprobaciones.tiempoPromedio || 0} días`}
          icon={Timer}
          color="primary"
          subtitle="Para aprobación"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLAs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cumplimiento de SLAs</h3>
          <div className="space-y-4">
            {data?.slas.map((sla, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{sla.nombre}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                      sla.estado === 'verde' ? 'text-green-600' :
                      sla.estado === 'amarillo' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {sla.cumplimiento}%
                    </span>
                    <span className="text-xs text-gray-400">/ {sla.objetivo}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sla.estado === 'verde' ? 'bg-green-500' :
                      sla.estado === 'amarillo' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${sla.cumplimiento}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos Comités */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Comités</h3>
          <div className="space-y-3">
            {data?.proximosComites.map((comite) => (
              <div
                key={comite.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{comite.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comite.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })}
                    {' · '}{comite.tipo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{comite.participantes} participantes</p>
                  <p className="text-xs text-accent">{comite.temas} temas</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <Timeline items={timelineItems} />
      </div>

      {/* Approval Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{data?.aprobaciones.aprobadas}</p>
          <p className="text-sm text-gray-500">Aprobadas este año</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{data?.aprobaciones.rechazadas}</p>
          <p className="text-sm text-gray-500">Rechazadas este año</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{data?.aprobaciones.pendientes}</p>
          <p className="text-sm text-gray-500">Pendientes de revisión</p>
        </div>
      </div>
    </div>
  );
}
