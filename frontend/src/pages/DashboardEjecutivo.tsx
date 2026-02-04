import { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import Card, { CardHeader } from '../components/common/Card';
import { SemaforoBadge } from '../components/common/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, AlertTriangle, Archive } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardEjecutivo() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      // Modo demo
      const token = localStorage.getItem('token');
      if (token?.startsWith('dev-token-')) {
        const mockData = {
          kpis: {
            total_proyectos: 12,
            presupuesto: {
              capex_aprobado: 2500000000,
              capex_comprometido: 1800000000,
              capex_ejecutado: 1200000000
            },
            semaforo: { verde: 6, amarillo: 4, rojo: 2 }
          },
          funnel: {
            funnel: {
              registradas: 45,
              evaluacion: 28,
              aprobadas: 18,
              ejecucion: 12,
              cerradas: 8
            }
          },
          proyectos_criticos: [
            { id: 1, codigo: 'PRY-001', nombre: 'Modernización ERP', semaforo: 'rojo', avance: 45, desviacion_presupuesto: 15 },
            { id: 2, codigo: 'PRY-003', nombre: 'Sistema CRM', semaforo: 'amarillo', avance: 62, desviacion_presupuesto: 8 }
          ],
          banco_reserva: { total_proyectos: 5 },
          ejecucion: {
            datos: [
              { mes: 1, planificado_acumulado: 200000000, ejecutado_acumulado: 180000000 },
              { mes: 2, planificado_acumulado: 400000000, ejecutado_acumulado: 350000000 },
              { mes: 3, planificado_acumulado: 650000000, ejecutado_acumulado: 580000000 },
              { mes: 4, planificado_acumulado: 900000000, ejecutado_acumulado: 820000000 },
              { mes: 5, planificado_acumulado: 1150000000, ejecutado_acumulado: 1050000000 },
              { mes: 6, planificado_acumulado: 1400000000, ejecutado_acumulado: 1200000000 }
            ]
          }
        };
        setData(mockData);
        setIsLoading(false);
        return;
      }

      try {
        const result = await dashboardService.getEjecutivo(selectedYear);
        setData(result);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, funnel, proyectos_criticos, banco_reserva, ejecucion } = data;

  // Preparar datos para gráficos
  const funnelData = Object.entries(funnel?.funnel || {}).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value: value as number,
  }));

  const presupuestoData = [
    { name: 'Aprobado', value: kpis?.presupuesto?.capex_aprobado || 0 },
    { name: 'Comprometido', value: kpis?.presupuesto?.capex_comprometido || 0 },
    { name: 'Ejecutado', value: kpis?.presupuesto?.capex_ejecutado || 0 },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
          <p className="text-gray-500 mt-1">
            Visión consolidada del portfolio de proyectos
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Proyectos"
          value={kpis?.total_proyectos || 0}
          icon={TrendingUp}
          color="blue"
        />
        <KPICard
          title="CAPEX Aprobado"
          value={formatCurrency(kpis?.presupuesto?.capex_aprobado || 0)}
          icon={DollarSign}
          color="green"
          isLarge
        />
        <KPICard
          title="CAPEX Ejecutado"
          value={formatCurrency(kpis?.presupuesto?.capex_ejecutado || 0)}
          icon={DollarSign}
          color="blue"
          isLarge
        />
        <KPICard
          title="En Banco Reserva"
          value={banco_reserva?.total_proyectos || 0}
          icon={Archive}
          color="purple"
        />
      </div>

      {/* Semáforo del Portfolio */}
      <Card>
        <CardHeader title="Salud del Portfolio" />
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-4xl font-bold text-green-600">
              {kpis?.semaforo?.verde || 0}
            </div>
            <p className="text-green-700 mt-1">En Control</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-4xl font-bold text-yellow-600">
              {kpis?.semaforo?.amarillo || 0}
            </div>
            <p className="text-yellow-700 mt-1">En Riesgo</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-4xl font-bold text-red-600">
              {kpis?.semaforo?.rojo || 0}
            </div>
            <p className="text-red-700 mt-1">Críticos</p>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel de Iniciativas */}
        <Card>
          <CardHeader title="Pipeline de Iniciativas" />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Presupuesto */}
        <Card>
          <CardHeader title="Ejecución Presupuestaria" />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={presupuestoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Curva S */}
      {ejecucion?.datos && ejecucion.datos.length > 0 && (
        <Card>
          <CardHeader title="Curva S - Ejecución Mensual" />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ejecucion.datos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tickFormatter={(m) => `Mes ${m}`} />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="planificado_acumulado"
                  stroke="#3b82f6"
                  name="Planificado"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="ejecutado_acumulado"
                  stroke="#22c55e"
                  name="Ejecutado"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Proyectos Críticos */}
      {proyectos_criticos && proyectos_criticos.length > 0 && (
        <Card>
          <CardHeader title="Proyectos que Requieren Atención" />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Semáforo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Avance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Desviación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proyectos_criticos.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SemaforoBadge semaforo={p.semaforo} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.avance}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          p.desviacion_presupuesto > 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }
                      >
                        {p.desviacion_presupuesto > 0 ? '+' : ''}
                        {p.desviacion_presupuesto}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function KPICard({
  title,
  value,
  icon: Icon,
  color,
  isLarge = false,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  isLarge?: boolean;
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`font-bold text-gray-900 ${isLarge ? 'text-lg' : 'text-2xl'}`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
