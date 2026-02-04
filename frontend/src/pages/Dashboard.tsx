import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, isJefeTD, isCGEDx } from '../store/authStore';
import { dashboardService } from '../services/api';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Lightbulb,
  FolderKanban,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await dashboardService.getPorRol();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const isExecutive = isJefeTD(user) || isCGEDx(user);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 text-sm text-gray-500">
        <Link to="/" className="text-accent hover:underline">Inicio</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Dashboard</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="text-gray-500 mt-1">
            Resumen de tu actividad en el sistema
          </p>
        </div>
        <Link to="/iniciativas/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Iniciativa
          </Button>
        </Link>
      </div>

      {/* KPIs Rápidos - Según rol */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vista Demandante */}
        {user?.rol === 'demandante' && dashboardData?.mis_iniciativas && (
          <>
            <StatCard
              title="Mis Iniciativas"
              value={dashboardData.mis_iniciativas.total}
              icon={Lightbulb}
              color="blue"
            />
            <StatCard
              title="En Proceso"
              value={dashboardData.mis_iniciativas.en_proceso}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Aprobadas"
              value={dashboardData.mis_iniciativas.aprobadas}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Borradores"
              value={dashboardData.mis_iniciativas.borradores}
              icon={AlertCircle}
              color="gray"
            />
          </>
        )}

        {/* Vista Ejecutiva (Jefe TD / CGEDx) */}
        {isExecutive && dashboardData?.kpis && (
          <>
            <StatCard
              title="Total Proyectos"
              value={dashboardData.kpis.total_proyectos}
              icon={FolderKanban}
              color="blue"
            />
            <StatCard
              title="En Ejecución"
              value={dashboardData.kpis.proyectos_por_estado?.en_ejecucion || 0}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Banco Reserva"
              value={dashboardData.kpis.proyectos_por_estado?.banco_reserva || 0}
              icon={Clock}
              color="cyan"
            />
            <StatCard
              title="En Riesgo"
              value={(dashboardData.kpis.semaforo?.amarillo || 0) + (dashboardData.kpis.semaforo?.rojo || 0)}
              icon={AlertCircle}
              color="red"
            />
          </>
        )}

        {/* Vista Comité de Expertos */}
        {user?.rol === 'comite_expertos' && (
          <>
            <StatCard
              title="Evaluaciones Pendientes"
              value={dashboardData?.evaluaciones_pendientes || 0}
              icon={AlertCircle}
              color="yellow"
            />
            <StatCard
              title="Evaluaciones Realizadas"
              value={dashboardData?.evaluaciones_realizadas || 0}
              icon={CheckCircle}
              color="green"
            />
          </>
        )}

        {/* Vista Analista TD */}
        {user?.rol === 'analista_td' && dashboardData?.kpis && (
          <>
            <StatCard
              title="Iniciativas Asignadas"
              value={dashboardData.kpis.iniciativas_pendientes || 0}
              icon={Lightbulb}
              color="blue"
            />
            <StatCard
              title="Proyectos Activos"
              value={dashboardData.kpis.total_proyectos || 0}
              icon={FolderKanban}
              color="green"
            />
          </>
        )}
      </div>

      {/* Acciones Rápidas y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acciones Rápidas */}
        <Card>
          <CardHeader title="Acciones Rápidas" />
          <div className="space-y-3">
            <ActionLink
              to="/iniciativas/nueva"
              icon={Plus}
              title="Nueva Iniciativa"
              description="Crear un nuevo requerimiento digital"
            />
            <ActionLink
              to="/iniciativas"
              icon={Lightbulb}
              title="Ver Iniciativas"
              description="Consultar todas las iniciativas"
            />
            <ActionLink
              to="/proyectos"
              icon={FolderKanban}
              title="Ver Proyectos"
              description="Consultar proyectos activos"
            />
            {isExecutive && (
              <ActionLink
                to="/dashboard-ejecutivo"
                icon={TrendingUp}
                title="Dashboard Ejecutivo"
                description="Métricas y KPIs del portfolio"
              />
            )}
          </div>
        </Card>

        {/* Semáforo del Portfolio (si es ejecutivo) */}
        {isExecutive && dashboardData?.kpis?.semaforo && (
          <Card>
            <CardHeader title="Salud del Portfolio" />
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="h-4 w-4 bg-green-500 rounded-full mr-3"></span>
                  <span className="font-medium">Proyectos en Control</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {dashboardData.kpis.semaforo.verde}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <span className="h-4 w-4 bg-yellow-500 rounded-full mr-3"></span>
                  <span className="font-medium">Proyectos en Riesgo</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {dashboardData.kpis.semaforo.amarillo}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <span className="h-4 w-4 bg-red-500 rounded-full mr-3"></span>
                  <span className="font-medium">Proyectos Críticos</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {dashboardData.kpis.semaforo.rojo}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Para comité de expertos */}
        {user?.rol === 'comite_expertos' && (
          <Card>
            <CardHeader
              title="Evaluaciones Pendientes"
              action={
                <Link to="/evaluaciones">
                  <Button variant="ghost" size="sm">
                    Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              }
            />
            {dashboardData?.evaluaciones_pendientes > 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-warning mb-2">
                  {dashboardData.evaluaciones_pendientes}
                </div>
                <p className="text-gray-500">
                  iniciativas esperando tu evaluación
                </p>
                <Link to="/evaluaciones" className="mt-4 inline-block">
                  <Button>Ir a Evaluar</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p>No tienes evaluaciones pendientes</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// Componentes auxiliares
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'cyan' | 'gray';
  trend?: { value: string; direction: 'up' | 'down' };
}) {
  const colors = {
    blue: 'bg-blue-100 text-accent',
    green: 'bg-green-100 text-success',
    yellow: 'bg-yellow-100 text-warning',
    red: 'bg-red-100 text-danger',
    cyan: 'bg-cyan-100 text-info',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <Card className="flex items-center stat-card-hover cursor-pointer">
      <div className={clsx('p-3 rounded-xl', colors[color])}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {trend && (
        <div className={clsx(
          'text-sm font-medium flex items-center',
          trend.direction === 'up' ? 'text-success' : 'text-danger'
        )}>
          {trend.direction === 'up' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
          {trend.value}
        </div>
      )}
    </Card>
  );
}

function ActionLink({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-accent/10">
        <Icon className="h-5 w-5 text-gray-600 group-hover:text-accent" />
      </div>
      <div className="ml-3 flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-accent" />
    </Link>
  );
}
