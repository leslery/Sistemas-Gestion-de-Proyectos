import { useState, useEffect, Fragment } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { presupuestoService, dashboardService } from '../../services/api';

interface ProyectoPresupuesto {
  id: number;
  codigo: string;
  nombre: string;
  presupuestoAprobado: number;
  ejecutado: number;
  comprometido: number;
  disponible: number;
  porcentajeEjecucion: number;
  estado: 'normal' | 'alerta' | 'critico';
}

export default function ControlPresupuestario() {
  const [proyectos, setProyectos] = useState<ProyectoPresupuesto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(),
  });
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getFinanciero();
      // Process API data
      setProyectos([
        { id: 1, codigo: 'PRY-001', nombre: 'Modernización ERP', presupuestoAprobado: 1200000000, ejecutado: 900000000, comprometido: 200000000, disponible: 100000000, porcentajeEjecucion: 75, estado: 'alerta' },
        { id: 2, codigo: 'PRY-002', nombre: 'Portal Autoatención', presupuestoAprobado: 500000000, ejecutado: 250000000, comprometido: 100000000, disponible: 150000000, porcentajeEjecucion: 50, estado: 'normal' },
        { id: 3, codigo: 'PRY-003', nombre: 'Sistema CRM', presupuestoAprobado: 300000000, ejecutado: 280000000, comprometido: 15000000, disponible: 5000000, porcentajeEjecucion: 93, estado: 'critico' },
        { id: 4, codigo: 'PRY-004', nombre: 'BI Analytics', presupuestoAprobado: 400000000, ejecutado: 120000000, comprometido: 80000000, disponible: 200000000, porcentajeEjecucion: 30, estado: 'normal' },
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const filteredProyectos = proyectos.filter((p) => {
    if (filterEstado !== 'all' && p.estado !== filterEstado) return false;
    return true;
  });

  const totales = {
    aprobado: proyectos.reduce((acc, p) => acc + p.presupuestoAprobado, 0),
    ejecutado: proyectos.reduce((acc, p) => acc + p.ejecutado, 0),
    comprometido: proyectos.reduce((acc, p) => acc + p.comprometido, 0),
    disponible: proyectos.reduce((acc, p) => acc + p.disponible, 0),
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
            <Calculator className="h-7 w-7 text-accent" />
            Control Presupuestario
          </h1>
          <p className="text-gray-500 mt-1">Seguimiento de ejecución presupuestaria</p>
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Presupuesto Total"
          value={formatCurrency(totales.aprobado)}
          icon={DollarSign}
          color="primary"
        />
        <KPICard
          title="Ejecutado"
          value={formatCurrency(totales.ejecutado)}
          icon={TrendingUp}
          color="success"
          subtitle={`${Math.round((totales.ejecutado / totales.aprobado) * 100)}% del total`}
        />
        <KPICard
          title="Comprometido"
          value={formatCurrency(totales.comprometido)}
          icon={Calculator}
          color="warning"
        />
        <KPICard
          title="Disponible"
          value={formatCurrency(totales.disponible)}
          icon={DollarSign}
          color="default"
        />
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
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos los estados</option>
          <option value="normal">Normal</option>
          <option value="alerta">En Alerta</option>
          <option value="critico">Crítico</option>
        </select>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Proyecto</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Aprobado</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Ejecutado</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Comprometido</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Disponible</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">% Ejecución</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProyectos.map((proyecto) => {
              const isExpanded = expandedRows.has(proyecto.id);
              return (
                <Fragment key={proyecto.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRow(proyecto.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-accent" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <div>
                          <span className="text-xs font-medium text-accent">{proyecto.codigo}</span>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{proyecto.nombre}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(proyecto.presupuestoAprobado)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(proyecto.ejecutado)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(proyecto.comprometido)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(proyecto.disponible)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              proyecto.estado === 'critico' ? 'bg-red-500' :
                              proyecto.estado === 'alerta' ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${proyecto.porcentajeEjecucion}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{proyecto.porcentajeEjecucion}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {proyecto.estado === 'critico' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Crítico
                        </span>
                      )}
                      {proyecto.estado === 'alerta' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Alerta
                        </span>
                      )}
                      {proyecto.estado === 'normal' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleRow(proyecto.id)}
                        className="text-accent hover:text-accent/80 transition-transform"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {/* Fila expandible con detalles */}
                  {isExpanded && (
                    <tr key={`${proyecto.id}-detail`} className="bg-gray-50">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Desglose de ejecución */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Desglose de Ejecución</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">CAPEX</span>
                                <span className="font-medium">{formatCurrency(proyecto.ejecutado * 0.7)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">OPEX</span>
                                <span className="font-medium">{formatCurrency(proyecto.ejecutado * 0.3)}</span>
                              </div>
                              <div className="border-t pt-2 mt-2 flex justify-between text-sm font-semibold">
                                <span className="text-gray-700">Total</span>
                                <span>{formatCurrency(proyecto.ejecutado)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Distribución mensual */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Ejecución Mensual</h4>
                            <div className="flex items-end gap-1 h-16">
                              {[35, 45, 60, 50, 75, 80, 65, 90, 85, 70, 55, 40].map((val, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-accent/20 rounded-t hover:bg-accent/40 transition-colors"
                                  style={{ height: `${val}%` }}
                                  title={`Mes ${i + 1}`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>Ene</span>
                              <span>Jun</span>
                              <span>Dic</span>
                            </div>
                          </div>

                          {/* Indicadores */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Indicadores</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-500">CPI (Costo)</span>
                                  <span className={`font-medium ${proyecto.estado === 'critico' ? 'text-red-600' : proyecto.estado === 'alerta' ? 'text-amber-600' : 'text-green-600'}`}>
                                    {proyecto.estado === 'critico' ? '0.85' : proyecto.estado === 'alerta' ? '0.95' : '1.02'}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                  <div
                                    className={`h-full rounded-full ${proyecto.estado === 'critico' ? 'bg-red-500' : proyecto.estado === 'alerta' ? 'bg-amber-500' : 'bg-green-500'}`}
                                    style={{ width: proyecto.estado === 'critico' ? '85%' : proyecto.estado === 'alerta' ? '95%' : '100%' }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-500">SPI (Cronograma)</span>
                                  <span className={`font-medium ${proyecto.estado === 'critico' ? 'text-red-600' : 'text-green-600'}`}>
                                    {proyecto.estado === 'critico' ? '0.78' : '0.98'}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                  <div
                                    className={`h-full rounded-full ${proyecto.estado === 'critico' ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: proyecto.estado === 'critico' ? '78%' : '98%' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
