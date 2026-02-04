import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Receipt,
  Wallet,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';
import { dashboardService, presupuestoService } from '../../services/api';

interface FinancialData {
  capex: {
    aprobado: number;
    comprometido: number;
    ejecutado: number;
    disponible: number;
  };
  opex: {
    proyectado: number;
    real: number;
    variacion: number;
  };
  curvaS: {
    mes: string;
    planificado: number;
    ejecutado: number;
  }[];
  alertas: {
    id: number;
    tipo: string;
    mensaje: string;
    proyecto: string;
    severidad: 'alta' | 'media' | 'baja';
  }[];
  topProyectos: {
    nombre: string;
    presupuesto: number;
    ejecutado: number;
    porcentaje: number;
  }[];
}

export default function DashboardFinanciero() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [financiero] = await Promise.all([
        dashboardService.getFinanciero(selectedYear),
      ]);

      // Combine API data with defaults
      setData({
        capex: {
          aprobado: financiero?.capex_aprobado || 5000000000,
          comprometido: financiero?.capex_comprometido || 3500000000,
          ejecutado: financiero?.capex_ejecutado || 2500000000,
          disponible: financiero?.capex_disponible || 1500000000,
        },
        opex: {
          proyectado: financiero?.opex_proyectado || 800000000,
          real: financiero?.opex_real || 720000000,
          variacion: financiero?.opex_variacion || -10,
        },
        curvaS: [
          { mes: 'Ene', planificado: 300, ejecutado: 280 },
          { mes: 'Feb', planificado: 600, ejecutado: 550 },
          { mes: 'Mar', planificado: 950, ejecutado: 880 },
          { mes: 'Abr', planificado: 1300, ejecutado: 1200 },
          { mes: 'May', planificado: 1700, ejecutado: 1580 },
          { mes: 'Jun', planificado: 2100, ejecutado: 1950 },
          { mes: 'Jul', planificado: 2500, ejecutado: 2350 },
          { mes: 'Ago', planificado: 2900, ejecutado: 2500 },
          { mes: 'Sep', planificado: 3300, ejecutado: 0 },
          { mes: 'Oct', planificado: 3800, ejecutado: 0 },
          { mes: 'Nov', planificado: 4300, ejecutado: 0 },
          { mes: 'Dic', planificado: 5000, ejecutado: 0 },
        ],
        alertas: [
          { id: 1, tipo: 'Sobrepresupuesto', mensaje: 'Proyecto ha excedido el 90% del presupuesto asignado', proyecto: 'Modernización ERP', severidad: 'alta' },
          { id: 2, tipo: 'Desviación', mensaje: 'Desviación de 15% respecto al plan financiero', proyecto: 'Migración Cloud', severidad: 'media' },
          { id: 3, tipo: 'Pendiente', mensaje: 'Pagos pendientes por aprobar', proyecto: 'Sistema CRM', severidad: 'baja' },
        ],
        topProyectos: [
          { nombre: 'Modernización ERP', presupuesto: 1200000000, ejecutado: 1080000000, porcentaje: 90 },
          { nombre: 'Migración Cloud', presupuesto: 800000000, ejecutado: 480000000, porcentaje: 60 },
          { nombre: 'Sistema CRM', presupuesto: 500000000, ejecutado: 250000000, porcentaje: 50 },
          { nombre: 'BI Analytics', presupuesto: 400000000, ejecutado: 160000000, porcentaje: 40 },
          { nombre: 'Portal Clientes', presupuesto: 300000000, ejecutado: 90000000, porcentaje: 30 },
        ],
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Set mock data
      setData({
        capex: { aprobado: 5000000000, comprometido: 3500000000, ejecutado: 2500000000, disponible: 1500000000 },
        opex: { proyectado: 800000000, real: 720000000, variacion: -10 },
        curvaS: [
          { mes: 'Ene', planificado: 300, ejecutado: 280 },
          { mes: 'Feb', planificado: 600, ejecutado: 550 },
          { mes: 'Mar', planificado: 950, ejecutado: 880 },
          { mes: 'Abr', planificado: 1300, ejecutado: 1200 },
          { mes: 'May', planificado: 1700, ejecutado: 1580 },
          { mes: 'Jun', planificado: 2100, ejecutado: 1950 },
          { mes: 'Jul', planificado: 2500, ejecutado: 2350 },
          { mes: 'Ago', planificado: 2900, ejecutado: 2500 },
        ],
        alertas: [
          { id: 1, tipo: 'Sobrepresupuesto', mensaje: 'Proyecto ha excedido el 90%', proyecto: 'Modernización ERP', severidad: 'alta' },
        ],
        topProyectos: [
          { nombre: 'Modernización ERP', presupuesto: 1200000000, ejecutado: 1080000000, porcentaje: 90 },
        ],
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

  const ejecucionCapex = data ? ((data.capex.ejecutado / data.capex.aprobado) * 100).toFixed(1) : '0';
  const compromisoCapex = data ? ((data.capex.comprometido / data.capex.aprobado) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-accent" />
            Dashboard Financiero
          </h1>
          <p className="text-gray-500 mt-1">Control de CAPEX, OPEX y ejecución presupuestaria</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
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

      {/* CAPEX Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="CAPEX Aprobado"
          value={formatCurrency(data?.capex.aprobado || 0)}
          icon={Wallet}
          color="primary"
          subtitle="Presupuesto total del año"
        />
        <KPICard
          title="CAPEX Comprometido"
          value={formatCurrency(data?.capex.comprometido || 0)}
          icon={PiggyBank}
          color="warning"
          subtitle={`${compromisoCapex}% del aprobado`}
        />
        <KPICard
          title="CAPEX Ejecutado"
          value={formatCurrency(data?.capex.ejecutado || 0)}
          icon={Receipt}
          color="success"
          trend={{ value: parseFloat(ejecucionCapex), direction: 'up', label: 'ejecutado' }}
        />
        <KPICard
          title="Disponible"
          value={formatCurrency(data?.capex.disponible || 0)}
          icon={DollarSign}
          color="default"
          subtitle="Sin comprometer"
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="capex">
        <TabList>
          <Tab value="capex">CAPEX</Tab>
          <Tab value="opex">OPEX</Tab>
          <Tab value="curva-s">Curva S</Tab>
          <Tab value="alertas">Alertas</Tab>
        </TabList>

        <TabPanel value="capex">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Ejecución</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Ejecutado</span>
                    <span className="font-medium">{ejecucionCapex}%</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${ejecucionCapex}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Comprometido</span>
                    <span className="font-medium">{compromisoCapex}%</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${compromisoCapex}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Projects */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Proyectos por Ejecución</h3>
              <div className="space-y-3">
                {data?.topProyectos.map((proyecto, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{proyecto.nombre}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${proyecto.porcentaje > 85 ? 'bg-red-500' : proyecto.porcentaje > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${proyecto.porcentaje}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{proyecto.porcentaje}%</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(proyecto.ejecutado)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="opex">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <KPICard
              title="OPEX Proyectado"
              value={formatCurrency(data?.opex.proyectado || 0)}
              icon={TrendingUp}
              color="primary"
            />
            <KPICard
              title="OPEX Real"
              value={formatCurrency(data?.opex.real || 0)}
              icon={Receipt}
              color="success"
            />
            <KPICard
              title="Variación"
              value={`${data?.opex.variacion || 0}%`}
              icon={data?.opex.variacion && data.opex.variacion < 0 ? TrendingDown : TrendingUp}
              color={data?.opex.variacion && data.opex.variacion < 0 ? 'success' : 'danger'}
              subtitle={data?.opex.variacion && data.opex.variacion < 0 ? 'Por debajo del presupuesto' : 'Por encima del presupuesto'}
            />
          </div>
        </TabPanel>

        <TabPanel value="curva-s">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Curva S de Ejecución</h3>
            <div className="h-[300px] flex items-end gap-4 px-4">
              {data?.curvaS.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-[250px]">
                    <div
                      className="flex-1 bg-gray-200 rounded-t"
                      style={{ height: `${(item.planificado / 50) * 100}%` }}
                      title={`Planificado: $${item.planificado}M`}
                    />
                    {item.ejecutado > 0 && (
                      <div
                        className="flex-1 bg-accent rounded-t"
                        style={{ height: `${(item.ejecutado / 50) * 100}%` }}
                        title={`Ejecutado: $${item.ejecutado}M`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{item.mes}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded" />
                <span className="text-sm text-gray-600">Planificado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded" />
                <span className="text-sm text-gray-600">Ejecutado</span>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="alertas">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Alertas Financieras</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {data?.alertas.map((alerta) => (
                <div key={alerta.id} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alerta.severidad === 'alta' ? 'bg-red-100 text-red-600' :
                      alerta.severidad === 'media' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{alerta.tipo}</p>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          alerta.severidad === 'alta' ? 'bg-red-100 text-red-700' :
                          alerta.severidad === 'media' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {alerta.severidad}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{alerta.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-1">Proyecto: {alerta.proyecto}</p>
                  </div>
                  <button className="text-accent hover:text-accent/80 text-sm font-medium">
                    Ver detalle
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
