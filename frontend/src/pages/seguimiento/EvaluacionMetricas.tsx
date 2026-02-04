import { useState } from 'react';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  RefreshCw,
  Download,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';

interface MetricaProyecto {
  id: number;
  codigo: string;
  nombre: string;
  avanceReal: number;
  avancePlanificado: number;
  cpi: number; // Cost Performance Index
  spi: number; // Schedule Performance Index
  eac: number; // Estimate at Completion
}

const proyectos: MetricaProyecto[] = [
  { id: 1, codigo: 'PRY-001', nombre: 'Modernización ERP', avanceReal: 45, avancePlanificado: 50, cpi: 0.95, spi: 0.90, eac: 1260000000 },
  { id: 2, codigo: 'PRY-002', nombre: 'Portal Autoatención', avanceReal: 78, avancePlanificado: 75, cpi: 1.05, spi: 1.04, eac: 475000000 },
  { id: 3, codigo: 'PRY-003', nombre: 'Sistema CRM', avanceReal: 30, avancePlanificado: 40, cpi: 0.85, spi: 0.75, eac: 350000000 },
  { id: 4, codigo: 'PRY-004', nombre: 'BI Analytics', avanceReal: 60, avancePlanificado: 55, cpi: 1.10, spi: 1.09, eac: 360000000 },
];

export default function EvaluacionMetricas() {
  const [selectedProyecto, setSelectedProyecto] = useState<MetricaProyecto | null>(proyectos[0]);

  const avgCPI = proyectos.reduce((acc, p) => acc + p.cpi, 0) / proyectos.length;
  const avgSPI = proyectos.reduce((acc, p) => acc + p.spi, 0) / proyectos.length;
  const avgAvance = proyectos.reduce((acc, p) => acc + p.avanceReal, 0) / proyectos.length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LineChart className="h-7 w-7 text-accent" />
            Evaluación y Métricas
          </h1>
          <p className="text-gray-500 mt-1">Indicadores de desempeño del portafolio</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="CPI Promedio"
          value={avgCPI.toFixed(2)}
          icon={TrendingUp}
          color={avgCPI >= 1 ? 'success' : avgCPI >= 0.9 ? 'warning' : 'danger'}
          subtitle="Cost Performance Index"
        />
        <KPICard
          title="SPI Promedio"
          value={avgSPI.toFixed(2)}
          icon={TrendingUp}
          color={avgSPI >= 1 ? 'success' : avgSPI >= 0.9 ? 'warning' : 'danger'}
          subtitle="Schedule Performance Index"
        />
        <KPICard
          title="Avance Promedio"
          value={`${Math.round(avgAvance)}%`}
          icon={Target}
          color="primary"
        />
        <KPICard
          title="Proyectos en Meta"
          value={`${proyectos.filter((p) => p.spi >= 1 && p.cpi >= 1).length}/${proyectos.length}`}
          icon={BarChart3}
          color="success"
        />
      </div>

      <Tabs defaultValue="overview">
        <TabList>
          <Tab value="overview">Vista General</Tab>
          <Tab value="earned-value">Valor Ganado</Tab>
          <Tab value="trends">Tendencias</Tab>
        </TabList>

        <TabPanel value="overview">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proyecto</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Avance Real</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Avance Plan</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">CPI</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">SPI</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">EAC</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proyectos.map((proyecto) => {
                  const status = proyecto.cpi >= 1 && proyecto.spi >= 1 ? 'good' :
                                 proyecto.cpi >= 0.9 && proyecto.spi >= 0.9 ? 'warning' : 'bad';

                  return (
                    <tr key={proyecto.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedProyecto(proyecto)}>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-accent">{proyecto.codigo}</span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{proyecto.nombre}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${proyecto.avanceReal}%` }} />
                          </div>
                          <span className="text-sm font-medium">{proyecto.avanceReal}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{proyecto.avancePlanificado}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                          proyecto.cpi >= 1 ? 'text-green-600' : proyecto.cpi >= 0.9 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {proyecto.cpi >= 1 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {proyecto.cpi.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                          proyecto.spi >= 1 ? 'text-green-600' : proyecto.spi >= 0.9 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {proyecto.spi >= 1 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {proyecto.spi.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{formatCurrency(proyecto.eac)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`w-3 h-3 rounded-full inline-block ${
                          status === 'good' ? 'bg-green-500' :
                          status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabPanel>

        <TabPanel value="earned-value">
          {selectedProyecto && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Análisis Valor Ganado: {selectedProyecto.nombre}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">CPI (Cost Performance Index)</span>
                    <span className={`text-lg font-bold ${
                      selectedProyecto.cpi >= 1 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedProyecto.cpi.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">SPI (Schedule Performance Index)</span>
                    <span className={`text-lg font-bold ${
                      selectedProyecto.spi >= 1 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedProyecto.spi.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">EAC (Estimate at Completion)</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedProyecto.eac)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interpretación</h3>
                <div className="space-y-3 text-sm">
                  {selectedProyecto.cpi < 1 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-800">CPI bajo 1.0</p>
                      <p className="text-red-600 mt-1">El proyecto está costando más de lo planificado. Se requiere control de costos.</p>
                    </div>
                  )}
                  {selectedProyecto.spi < 1 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="font-medium text-amber-800">SPI bajo 1.0</p>
                      <p className="text-amber-600 mt-1">El proyecto está atrasado respecto al cronograma. Evaluar acciones de recuperación.</p>
                    </div>
                  )}
                  {selectedProyecto.cpi >= 1 && selectedProyecto.spi >= 1 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-medium text-green-800">Proyecto en Meta</p>
                      <p className="text-green-600 mt-1">El proyecto cumple con los indicadores de costo y cronograma planificados.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabPanel>

        <TabPanel value="trends">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Indicadores</h3>
            <p className="text-gray-500 text-sm">Gráfico de tendencias en desarrollo...</p>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
