import { useState, useEffect } from 'react';
import {
  PieChart,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FolderKanban,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import { KPICard, MiniKPI } from '../../components/ui/KPICard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { dashboardService, seguimientoService } from '../../services/api';

interface PortfolioData {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosCompletados: number;
  presupuestoTotal: number;
  presupuestoEjecutado: number;
  avancePromedio: number;
  porEstado: { estado: string; cantidad: number; monto: number }[];
  porArea: { area: string; cantidad: number; monto: number }[];
  semaforo: { verde: number; amarillo: number; rojo: number };
}

export default function DashboardPortafolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(),
  });
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [dateRange, filterArea, filterEstado]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ejecutivo, resumen] = await Promise.all([
        dashboardService.getEjecutivo(),
        seguimientoService.getResumenPortfolio(),
      ]);

      setData({
        totalProyectos: ejecutivo.total_proyectos || 25,
        proyectosActivos: ejecutivo.proyectos_por_estado?.en_ejecucion || 12,
        proyectosCompletados: ejecutivo.proyectos_por_estado?.completado || 8,
        presupuestoTotal: ejecutivo.presupuesto?.capex_aprobado || 5000000000,
        presupuestoEjecutado: ejecutivo.presupuesto?.capex_ejecutado || 2500000000,
        avancePromedio: resumen?.avance_promedio || 45,
        porEstado: [
          { estado: 'En Ejecución', cantidad: 12, monto: 2500000000 },
          { estado: 'Planificado', cantidad: 5, monto: 1200000000 },
          { estado: 'Completado', cantidad: 8, monto: 1300000000 },
        ],
        porArea: [
          { area: 'TI', cantidad: 8, monto: 2000000000 },
          { area: 'Operaciones', cantidad: 6, monto: 1500000000 },
          { area: 'Comercial', cantidad: 5, monto: 1000000000 },
          { area: 'RRHH', cantidad: 3, monto: 300000000 },
          { area: 'Finanzas', cantidad: 3, monto: 200000000 },
        ],
        semaforo: ejecutivo.semaforo || { verde: 15, amarillo: 7, rojo: 3 },
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      // Set mock data for demo
      setData({
        totalProyectos: 25,
        proyectosActivos: 12,
        proyectosCompletados: 8,
        presupuestoTotal: 5000000000,
        presupuestoEjecutado: 2500000000,
        avancePromedio: 45,
        porEstado: [
          { estado: 'En Ejecución', cantidad: 12, monto: 2500000000 },
          { estado: 'Planificado', cantidad: 5, monto: 1200000000 },
          { estado: 'Completado', cantidad: 8, monto: 1300000000 },
        ],
        porArea: [
          { area: 'TI', cantidad: 8, monto: 2000000000 },
          { area: 'Operaciones', cantidad: 6, monto: 1500000000 },
          { area: 'Comercial', cantidad: 5, monto: 1000000000 },
          { area: 'RRHH', cantidad: 3, monto: 300000000 },
          { area: 'Finanzas', cantidad: 3, monto: 200000000 },
        ],
        semaforo: { verde: 15, amarillo: 7, rojo: 3 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="h-7 w-7 text-accent" />
            Dashboard de Portafolio
          </h1>
          <p className="text-gray-500 mt-1">Vista consolidada de todos los proyectos e iniciativas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <Filter className="h-5 w-5 text-gray-400" />
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-[280px]"
        />
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todas las áreas</option>
          <option value="ti">TI</option>
          <option value="operaciones">Operaciones</option>
          <option value="comercial">Comercial</option>
          <option value="rrhh">RRHH</option>
          <option value="finanzas">Finanzas</option>
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los estados</option>
          <option value="planificado">Planificado</option>
          <option value="en_ejecucion">En Ejecución</option>
          <option value="completado">Completado</option>
          <option value="pausado">Pausado</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Proyectos"
          value={data?.totalProyectos || 0}
          icon={FolderKanban}
          color="primary"
          trend={{ value: 12, direction: 'up', label: 'vs año anterior' }}
        />
        <KPICard
          title="Presupuesto Total"
          value={formatCurrency(data?.presupuestoTotal || 0)}
          icon={DollarSign}
          color="success"
          subtitle={`Ejecutado: ${formatCurrency(data?.presupuestoEjecutado || 0)}`}
        />
        <KPICard
          title="Avance Promedio"
          value={`${data?.avancePromedio || 0}%`}
          icon={TrendingUp}
          color="primary"
          trend={{ value: 5, direction: 'up', label: 'vs mes anterior' }}
        />
        <KPICard
          title="Proyectos en Riesgo"
          value={data?.semaforo.rojo || 0}
          icon={AlertTriangle}
          color="danger"
          subtitle={`${data?.semaforo.amarillo || 0} en alerta`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semáforo de Salud */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Semáforo de Salud</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-green-600">{data?.semaforo.verde}</span>
              </div>
              <p className="text-sm text-gray-600">En buen estado</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-amber-600">{data?.semaforo.amarillo}</span>
              </div>
              <p className="text-sm text-gray-600">En alerta</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-red-600">{data?.semaforo.rojo}</span>
              </div>
              <p className="text-sm text-gray-600">Críticos</p>
            </div>
          </div>
        </div>

        {/* Por Estado */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
          <div className="space-y-3">
            {data?.porEstado.map((item) => (
              <div key={item.estado} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      'w-3 h-3 rounded-full',
                      item.estado === 'En Ejecución' && 'bg-blue-500',
                      item.estado === 'Planificado' && 'bg-gray-400',
                      item.estado === 'Completado' && 'bg-green-500'
                    )}
                  />
                  <span className="text-sm text-gray-700">{item.estado}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{item.cantidad}</span>
                  <span className="text-xs text-gray-500 ml-2">{formatCurrency(item.monto)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Por Área */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Área</h3>
        <div className="space-y-4">
          {data?.porArea.map((item) => {
            const percentage = ((item.monto / (data?.presupuestoTotal || 1)) * 100).toFixed(1);
            return (
              <div key={item.area}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.area}</span>
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{item.cantidad}</span> proyectos ·{' '}
                    <span className="font-semibold text-gray-900">{formatCurrency(item.monto)}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">45</p>
          <p className="text-xs text-gray-500">Días promedio de ejecución</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">92%</p>
          <p className="text-xs text-gray-500">Tasa de finalización</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <TrendingUp className="h-6 w-6 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">1.2x</p>
          <p className="text-xs text-gray-500">ROI promedio</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <BarChart3 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">87%</p>
          <p className="text-xs text-gray-500">Satisfacción stakeholders</p>
        </div>
      </div>
    </div>
  );
}
