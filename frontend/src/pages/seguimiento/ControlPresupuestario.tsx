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
  Plus,
  Upload,
  X,
  FileSpreadsheet,
  Calendar,
  Info,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { presupuestoService, dashboardService, seguimientoService, proyectosService } from '../../services/api';

interface PresupuestoDetalle {
  desglose: {
    capex: {
      aprobado: number;
      comprometido: number;
      ejecutado: number;
      disponible: number;
    };
    opex: {
      proyectado_anual: number;
      tipo: string;
    };
  };
  indicadores: {
    cpi: number;
    cpi_estado: 'normal' | 'alerta' | 'critico';
    spi: number;
    spi_estado: 'normal' | 'alerta' | 'critico';
  };
  tiene_presupuesto_detallado: boolean;
}
import { useToast } from '../../components/ui/Toast';
import * as XLSX from 'xlsx';

interface EjecucionMensual {
  id?: number;
  año: number;
  mes: number;
  periodo: string;
  capex_planificado: number;
  capex_ejecutado: number;
  avance_planificado: number;
  avance_real: number;
  comentarios?: string;
}

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
  ejecucionesMensuales?: EjecucionMensual[];
  presupuestoDetalle?: PresupuestoDetalle;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ControlPresupuestario() {
  const { showToast } = useToast();
  const [proyectos, setProyectos] = useState<ProyectoPresupuesto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(),
  });
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Modal de registro
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoPresupuesto | null>(null);
  const [registroForm, setRegistroForm] = useState({
    año: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    capex_planificado: '',
    capex_ejecutado: '',
    avance_planificado: '',
    avance_real: '',
    comentarios: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de importación
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

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
      // Intentar obtener proyectos reales del backend
      const proyectosData = await proyectosService.getAll({ estado: 'en_ejecucion' }).catch(() => []);

      if (proyectosData && proyectosData.length > 0) {
        // Mapear proyectos reales
        const proyectosMapeados = await Promise.all(
          proyectosData.map(async (p: any) => {
            // Obtener ejecuciones mensuales para cada proyecto
            const ejecuciones = await seguimientoService.getEjecucionProyecto(p.id, dateRange.end?.getFullYear()).catch(() => []);

            // Obtener presupuesto detallado con indicadores
            const presupuestoDetalle = await presupuestoService.getDetalle(p.id).catch(() => null);

            const totalEjecutado = ejecuciones.reduce((acc: number, e: any) => acc + (e.capex_ejecutado || 0), 0);
            const presupuesto = p.presupuesto_asignado || 0;

            // Usar datos del presupuesto detallado si existe
            const capexAprobado = presupuestoDetalle?.desglose?.capex?.aprobado || presupuesto * 0.8;
            const capexEjecutado = presupuestoDetalle?.desglose?.capex?.ejecutado || totalEjecutado;
            const capexComprometido = presupuestoDetalle?.desglose?.capex?.comprometido || 0;

            const porcentaje = capexAprobado > 0 ? Math.round((capexEjecutado / capexAprobado) * 100) : 0;

            // Determinar estado basado en indicadores CPI si disponible
            let estado: 'normal' | 'alerta' | 'critico' = 'normal';
            if (presupuestoDetalle?.indicadores) {
              estado = presupuestoDetalle.indicadores.cpi_estado;
            } else {
              estado = porcentaje > 90 ? 'critico' : porcentaje > 70 ? 'alerta' : 'normal';
            }

            return {
              id: p.id,
              codigo: p.codigo_proyecto,
              nombre: p.nombre,
              presupuestoAprobado: capexAprobado,
              ejecutado: capexEjecutado,
              comprometido: capexComprometido,
              disponible: capexAprobado - capexEjecutado - capexComprometido,
              porcentajeEjecucion: porcentaje,
              estado,
              ejecucionesMensuales: ejecuciones,
              presupuestoDetalle,
            };
          })
        );
        setProyectos(proyectosMapeados as ProyectoPresupuesto[]);
      } else {
        // Datos mock si no hay datos reales
        setProyectos([
          { id: 1, codigo: 'PRY-001', nombre: 'Modernización ERP', presupuestoAprobado: 1200000000, ejecutado: 900000000, comprometido: 200000000, disponible: 100000000, porcentajeEjecucion: 75, estado: 'alerta', ejecucionesMensuales: [] },
          { id: 2, codigo: 'PRY-002', nombre: 'Portal Autoatención', presupuestoAprobado: 500000000, ejecutado: 250000000, comprometido: 100000000, disponible: 150000000, porcentajeEjecucion: 50, estado: 'normal', ejecucionesMensuales: [] },
          { id: 3, codigo: 'PRY-003', nombre: 'Sistema CRM', presupuestoAprobado: 300000000, ejecutado: 280000000, comprometido: 15000000, disponible: 5000000, porcentajeEjecucion: 93, estado: 'critico', ejecucionesMensuales: [] },
          { id: 4, codigo: 'PRY-004', nombre: 'BI Analytics', presupuestoAprobado: 400000000, ejecutado: 120000000, comprometido: 80000000, disponible: 200000000, porcentajeEjecucion: 30, estado: 'normal', ejecucionesMensuales: [] },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar datos', 'error');
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

  // Abrir modal de registro
  const handleOpenRegistro = (proyecto: ProyectoPresupuesto) => {
    setSelectedProyecto(proyecto);
    setRegistroForm({
      año: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      capex_planificado: '',
      capex_ejecutado: '',
      avance_planificado: '',
      avance_real: '',
      comentarios: '',
    });
    setShowRegistroModal(true);
  };

  // Guardar registro mensual
  const handleSaveRegistro = async () => {
    if (!selectedProyecto) return;

    if (!registroForm.capex_ejecutado && !registroForm.capex_planificado) {
      showToast('Debe ingresar al menos el monto planificado o ejecutado', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await seguimientoService.registrarEjecucion({
        proyecto_id: selectedProyecto.id,
        año: registroForm.año,
        mes: registroForm.mes,
        capex_planificado: parseFloat(registroForm.capex_planificado) || 0,
        capex_ejecutado: parseFloat(registroForm.capex_ejecutado) || 0,
        avance_planificado: parseInt(registroForm.avance_planificado) || 0,
        avance_real: parseInt(registroForm.avance_real) || 0,
        comentarios: registroForm.comentarios,
      });

      showToast(`Registro de ${MESES[registroForm.mes - 1]} guardado correctamente`, 'success');
      setShowRegistroModal(false);
      fetchData(); // Recargar datos
    } catch (error: any) {
      console.error('Error:', error);
      showToast(error.response?.data?.detail || 'Error al guardar registro', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar archivo de importación
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setImportPreview(jsonData.slice(0, 5)); // Mostrar primeras 5 filas
      } catch (error) {
        showToast('Error al leer el archivo Excel', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Importar datos desde Excel
  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let exitosos = 0;
          let errores = 0;

          for (const row of jsonData as any[]) {
            try {
              // Buscar proyecto por código
              const proyecto = proyectos.find(p =>
                p.codigo === row.codigo_proyecto || p.codigo === row.codigo
              );

              if (proyecto) {
                await seguimientoService.registrarEjecucion({
                  proyecto_id: proyecto.id,
                  año: row.año || row.anio || new Date().getFullYear(),
                  mes: row.mes,
                  capex_planificado: parseFloat(row.capex_planificado || row.planificado) || 0,
                  capex_ejecutado: parseFloat(row.capex_ejecutado || row.ejecutado) || 0,
                  avance_planificado: parseInt(row.avance_planificado) || 0,
                  avance_real: parseInt(row.avance_real) || 0,
                  comentarios: row.comentarios || `Importado desde Excel`,
                });
                exitosos++;
              } else {
                errores++;
              }
            } catch {
              errores++;
            }
          }

          showToast(`Importación completada: ${exitosos} registros exitosos, ${errores} errores`, exitosos > 0 ? 'success' : 'error');
          setShowImportModal(false);
          setImportFile(null);
          setImportPreview([]);
          fetchData();
        } catch (error) {
          showToast('Error al procesar el archivo', 'error');
        }
        setIsImporting(false);
      };
      reader.readAsArrayBuffer(importFile);
    } catch (error) {
      showToast('Error al importar datos', 'error');
      setIsImporting(false);
    }
  };

  // Descargar plantilla Excel
  const handleDownloadTemplate = () => {
    const template = [
      {
        codigo_proyecto: 'PRY-001',
        año: 2026,
        mes: 1,
        capex_planificado: 100000000,
        capex_ejecutado: 95000000,
        avance_planificado: 10,
        avance_real: 8,
        comentarios: 'Ejecución enero',
      },
      {
        codigo_proyecto: 'PRY-001',
        año: 2026,
        mes: 2,
        capex_planificado: 100000000,
        capex_ejecutado: 110000000,
        avance_planificado: 20,
        avance_real: 22,
        comentarios: 'Ejecución febrero',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 15 }, { wch: 8 }, { wch: 6 }, { wch: 18 },
      { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 30 }
    ];

    XLSX.writeFile(wb, 'plantilla_ejecucion_mensual.xlsx');
  };

  // Obtener datos del gráfico para un proyecto
  const getChartData = (proyecto: ProyectoPresupuesto) => {
    const ejecuciones = proyecto.ejecucionesMensuales || [];
    const chartData = Array(12).fill(0);
    const planData = Array(12).fill(0);

    ejecuciones.forEach((e) => {
      if (e.mes >= 1 && e.mes <= 12) {
        chartData[e.mes - 1] = e.capex_ejecutado;
        planData[e.mes - 1] = e.capex_planificado;
      }
    });

    // Si no hay datos, generar datos de ejemplo
    if (ejecuciones.length === 0) {
      const monthlyBudget = proyecto.presupuestoAprobado / 12;
      for (let i = 0; i < 12; i++) {
        const variation = 0.7 + Math.random() * 0.6; // 70% a 130%
        chartData[i] = Math.round(monthlyBudget * variation * (i < new Date().getMonth() ? 1 : 0));
        planData[i] = monthlyBudget;
      }
    }

    return { chartData, planData };
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
          <p className="text-gray-500 mt-1">Seguimiento de ejecución presupuestaria mensual</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-accent bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Importar Excel
          </button>
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

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Registro de Ejecución Mensual</p>
          <p className="mt-1">El presupuesto planificado y ejecutado debe registrarse mensualmente para cada proyecto.
          Use el botón <strong>"+ Registrar"</strong> en cada proyecto o <strong>"Importar Excel"</strong> para carga masiva.</p>
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
          subtitle={`${Math.round((totales.ejecutado / totales.aprobado) * 100) || 0}% del total`}
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
              const { chartData, planData } = getChartData(proyecto);
              const maxValue = Math.max(...chartData, ...planData, 1);

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
                            style={{ width: `${Math.min(proyecto.porcentajeEjecucion, 100)}%` }}
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
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="ml-8 space-y-4">
                          {/* Botón de registro */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleOpenRegistro(proyecto)}
                              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                            >
                              <Plus className="h-4 w-4" />
                              Registrar Ejecución Mensual
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Desglose de ejecución */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Desglose Presupuestario</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">CAPEX Aprobado</span>
                                  <span className="font-medium">{formatCurrency(proyecto.presupuestoDetalle?.desglose?.capex?.aprobado || proyecto.presupuestoAprobado)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">CAPEX Ejecutado</span>
                                  <span className="font-medium text-blue-600">{formatCurrency(proyecto.presupuestoDetalle?.desglose?.capex?.ejecutado || proyecto.ejecutado)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">CAPEX Comprometido</span>
                                  <span className="font-medium text-amber-600">{formatCurrency(proyecto.presupuestoDetalle?.desglose?.capex?.comprometido || proyecto.comprometido)}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">OPEX Anual</span>
                                    <span className="font-medium">{formatCurrency(proyecto.presupuestoDetalle?.desglose?.opex?.proyectado_anual || 0)}</span>
                                  </div>
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between text-sm font-semibold">
                                  <span className="text-gray-700">Disponible</span>
                                  <span className={proyecto.disponible < 0 ? 'text-red-600' : 'text-green-600'}>
                                    {formatCurrency(proyecto.presupuestoDetalle?.desglose?.capex?.disponible || proyecto.disponible)}
                                  </span>
                                </div>
                              </div>
                              {!proyecto.presupuestoDetalle?.tiene_presupuesto_detallado && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Presupuesto estimado (no detallado)
                                </p>
                              )}
                            </div>

                            {/* Gráfico de ejecución mensual */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Ejecución vs Plan Mensual</h4>
                              <div className="flex items-end gap-1 h-20">
                                {chartData.map((val, i) => (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                    {/* Barra de plan (fondo) */}
                                    <div className="w-full relative" style={{ height: '60px' }}>
                                      <div
                                        className="absolute bottom-0 w-full bg-gray-200 rounded-t"
                                        style={{ height: `${(planData[i] / maxValue) * 100}%` }}
                                        title={`Plan: ${formatCurrency(planData[i])}`}
                                      />
                                      <div
                                        className={`absolute bottom-0 w-full rounded-t transition-colors ${
                                          val > planData[i] ? 'bg-red-400' : 'bg-accent/60'
                                        } hover:opacity-80`}
                                        style={{ height: `${(val / maxValue) * 100}%` }}
                                        title={`Ejecutado: ${formatCurrency(val)}`}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>Ene</span>
                                <span>Jun</span>
                                <span>Dic</span>
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-accent/60 rounded" />
                                  <span className="text-gray-500">Ejecutado</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-gray-200 rounded" />
                                  <span className="text-gray-500">Planificado</span>
                                </div>
                              </div>
                            </div>

                            {/* Indicadores */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Indicadores de Desempeño</h4>
                              {(() => {
                                const cpi = proyecto.presupuestoDetalle?.indicadores?.cpi || 1;
                                const spi = proyecto.presupuestoDetalle?.indicadores?.spi || 1;
                                const cpiEstado = proyecto.presupuestoDetalle?.indicadores?.cpi_estado || 'normal';
                                const spiEstado = proyecto.presupuestoDetalle?.indicadores?.spi_estado || 'normal';

                                const getColorClass = (estado: string) => {
                                  if (estado === 'critico') return 'text-red-600';
                                  if (estado === 'alerta') return 'text-amber-600';
                                  return 'text-green-600';
                                };

                                const getBgClass = (estado: string) => {
                                  if (estado === 'critico') return 'bg-red-500';
                                  if (estado === 'alerta') return 'bg-amber-500';
                                  return 'bg-green-500';
                                };

                                return (
                                  <div className="space-y-3">
                                    <div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">CPI (Índice Costo)</span>
                                        <span className={`font-medium ${getColorClass(cpiEstado)}`}>
                                          {cpi.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                        <div
                                          className={`h-full rounded-full ${getBgClass(cpiEstado)}`}
                                          style={{ width: `${Math.min(cpi * 100, 100)}%` }}
                                        />
                                      </div>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {cpi >= 1 ? 'Bajo presupuesto ✓' : cpi >= 0.9 ? 'Levemente sobre presupuesto' : 'Sobre presupuesto ⚠'}
                                      </p>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">SPI (Índice Cronograma)</span>
                                        <span className={`font-medium ${getColorClass(spiEstado)}`}>
                                          {spi.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                        <div
                                          className={`h-full rounded-full ${getBgClass(spiEstado)}`}
                                          style={{ width: `${Math.min(spi * 100, 100)}%` }}
                                        />
                                      </div>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {spi >= 1 ? 'A tiempo o adelantado ✓' : spi >= 0.9 ? 'Leve retraso' : 'Atrasado ⚠'}
                                      </p>
                                    </div>
                                    {!proyecto.presupuestoDetalle && (
                                      <p className="text-xs text-gray-400 mt-2 italic">
                                        Indicadores estimados. Registre ejecución mensual para cálculos precisos.
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Tabla de ejecuciones mensuales */}
                          {proyecto.ejecucionesMensuales && proyecto.ejecucionesMensuales.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900">Detalle de Ejecución Mensual</h4>
                              </div>
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Período</th>
                                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Planificado</th>
                                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Ejecutado</th>
                                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Diferencia</th>
                                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Avance Plan</th>
                                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Avance Real</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {proyecto.ejecucionesMensuales.map((e, idx) => {
                                    const diff = e.capex_ejecutado - e.capex_planificado;
                                    return (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{MESES[e.mes - 1]} {e.año}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(e.capex_planificado)}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(e.capex_ejecutado)}</td>
                                        <td className={`px-4 py-2 text-right font-medium ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                                        </td>
                                        <td className="px-4 py-2 text-center">{e.avance_planificado}%</td>
                                        <td className="px-4 py-2 text-center">{e.avance_real}%</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
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

      {/* Modal de Registro */}
      {showRegistroModal && selectedProyecto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Registrar Ejecución Mensual</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedProyecto.codigo} - {selectedProyecto.nombre}
                </p>
              </div>
              <button
                onClick={() => setShowRegistroModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                  <select
                    value={registroForm.año}
                    onChange={(e) => setRegistroForm({ ...registroForm, año: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mes *</label>
                  <select
                    value={registroForm.mes}
                    onChange={(e) => setRegistroForm({ ...registroForm, mes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                  >
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Montos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX Planificado</label>
                  <input
                    type="number"
                    value={registroForm.capex_planificado}
                    onChange={(e) => setRegistroForm({ ...registroForm, capex_planificado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX Ejecutado *</label>
                  <input
                    type="number"
                    value={registroForm.capex_ejecutado}
                    onChange={(e) => setRegistroForm({ ...registroForm, capex_ejecutado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Avance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avance Planificado (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={registroForm.avance_planificado}
                    onChange={(e) => setRegistroForm({ ...registroForm, avance_planificado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avance Real (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={registroForm.avance_real}
                    onChange={(e) => setRegistroForm({ ...registroForm, avance_real: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Comentarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                <textarea
                  value={registroForm.comentarios}
                  onChange={(e) => setRegistroForm({ ...registroForm, comentarios: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent resize-none"
                  placeholder="Observaciones del período..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowRegistroModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRegistro}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importación */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Importar Ejecución desde Excel</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Cargue un archivo Excel con la ejecución mensual de múltiples proyectos
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Descargar plantilla */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Plantilla de Importación</p>
                    <p className="text-xs text-blue-700">Descargue la plantilla con el formato correcto</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Descargar
                </button>
              </div>

              {/* Columnas requeridas */}
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Columnas requeridas:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="px-2 py-1 bg-gray-100 rounded">codigo_proyecto</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">año</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">mes (1-12)</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">capex_planificado</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">capex_ejecutado</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">avance_planificado</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">avance_real</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">comentarios (opcional)</span>
                </div>
              </div>

              {/* Subir archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Archivo Excel</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="excel-file"
                  />
                  <label htmlFor="excel-file" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {importFile ? importFile.name : 'Haga clic para seleccionar o arrastre un archivo'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Solo archivos .xlsx o .xls</p>
                  </label>
                </div>
              </div>

              {/* Vista previa */}
              {importPreview.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Vista previa (primeras 5 filas):</p>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(importPreview[0]).map((key) => (
                            <th key={key} className="px-2 py-1 text-left font-medium text-gray-500">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="px-2 py-1">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile || isImporting}
                className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isImporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Importar Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
