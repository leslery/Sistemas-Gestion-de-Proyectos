import { useState } from 'react';
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  Play,
  Clock,
  CheckCircle,
  FolderKanban,
  DollarSign,
  Users,
  TrendingUp,
} from 'lucide-react';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';

interface ReportTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  formato: ('pdf' | 'excel')[];
  icon: typeof FileBarChart;
  ultimaGeneracion?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'portafolio',
    nombre: 'Reporte de Portafolio',
    descripcion: 'Estado general de todos los proyectos e iniciativas',
    categoria: 'Ejecutivo',
    formato: ['pdf', 'excel'],
    icon: FolderKanban,
    ultimaGeneracion: '2024-02-10',
  },
  {
    id: 'financiero',
    nombre: 'Reporte Financiero',
    descripcion: 'CAPEX, OPEX y ejecución presupuestaria detallada',
    categoria: 'Financiero',
    formato: ['pdf', 'excel'],
    icon: DollarSign,
    ultimaGeneracion: '2024-02-09',
  },
  {
    id: 'avance',
    nombre: 'Reporte de Avance',
    descripcion: 'Progreso de proyectos vs planificación',
    categoria: 'Operativo',
    formato: ['pdf', 'excel'],
    icon: TrendingUp,
  },
  {
    id: 'gobernanza',
    nombre: 'Reporte de Gobernanza',
    descripcion: 'Comités, aprobaciones y cumplimiento de SLAs',
    categoria: 'Ejecutivo',
    formato: ['pdf'],
    icon: Users,
  },
  {
    id: 'riesgos',
    nombre: 'Matriz de Riesgos',
    descripcion: 'Riesgos identificados y planes de mitigación',
    categoria: 'Operativo',
    formato: ['pdf', 'excel'],
    icon: FileBarChart,
  },
  {
    id: 'kpis',
    nombre: 'Dashboard de KPIs',
    descripcion: 'Indicadores clave de rendimiento del período',
    categoria: 'Ejecutivo',
    formato: ['pdf'],
    icon: TrendingUp,
  },
];

interface GeneratedReport {
  id: string;
  nombre: string;
  fecha: string;
  formato: 'pdf' | 'excel';
  tamaño: string;
  estado: 'completado' | 'procesando' | 'error';
}

export default function CentroReportes() {
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(),
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    { id: '1', nombre: 'Reporte de Portafolio - Febrero 2024', fecha: '2024-02-10', formato: 'pdf', tamaño: '2.4 MB', estado: 'completado' },
    { id: '2', nombre: 'Reporte Financiero Q1', fecha: '2024-02-09', formato: 'excel', tamaño: '1.8 MB', estado: 'completado' },
    { id: '3', nombre: 'Matriz de Riesgos', fecha: '2024-02-08', formato: 'pdf', tamaño: '890 KB', estado: 'completado' },
  ]);

  const categories = ['all', ...new Set(reportTemplates.map((r) => r.categoria))];

  const filteredTemplates = selectedCategory === 'all'
    ? reportTemplates
    : reportTemplates.filter((r) => r.categoria === selectedCategory);

  const handleGenerateReport = async (templateId: string, formato: 'pdf' | 'excel') => {
    const template = reportTemplates.find((t) => t.id === templateId);
    if (!template) return;

    setGeneratingReport(`${templateId}-${formato}`);

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newReport: GeneratedReport = {
      id: Date.now().toString(),
      nombre: `${template.nombre} - ${new Date().toLocaleDateString('es-CL')}`,
      fecha: new Date().toISOString().split('T')[0],
      formato,
      tamaño: formato === 'pdf' ? '1.2 MB' : '850 KB',
      estado: 'completado',
    };

    setGeneratedReports((prev) => [newReport, ...prev]);
    setGeneratingReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="h-7 w-7 text-accent" />
            Centro de Reportes
          </h1>
          <p className="text-gray-500 mt-1">Genera y descarga reportes personalizados</p>
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todas las categorías</option>
          {categories.filter((c) => c !== 'all').map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="templates">
        <TabList>
          <Tab value="templates">Plantillas de Reportes</Tab>
          <Tab value="generated">Reportes Generados</Tab>
          <Tab value="scheduled">Programados</Tab>
        </TabList>

        <TabPanel value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900">{template.nombre}</h3>
                      <p className="text-sm text-gray-500 mt-1">{template.descripcion}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {template.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    {template.formato.includes('pdf') && (
                      <button
                        onClick={() => handleGenerateReport(template.id, 'pdf')}
                        disabled={generatingReport === `${template.id}-pdf`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {generatingReport === `${template.id}-pdf` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        PDF
                      </button>
                    )}
                    {template.formato.includes('excel') && (
                      <button
                        onClick={() => handleGenerateReport(template.id, 'excel')}
                        disabled={generatingReport === `${template.id}-excel`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        {generatingReport === `${template.id}-excel` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                        ) : (
                          <FileSpreadsheet className="h-4 w-4" />
                        )}
                        Excel
                      </button>
                    )}
                  </div>

                  {template.ultimaGeneracion && (
                    <p className="text-xs text-gray-400 mt-3">
                      Última generación: {new Date(template.ultimaGeneracion).toLocaleDateString('es-CL')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </TabPanel>

        <TabPanel value="generated">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Reporte
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Fecha
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Formato
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Tamaño
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Estado
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {generatedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{report.nombre}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(report.fecha).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                          report.formato === 'pdf'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {report.formato === 'pdf' ? (
                          <FileText className="h-3 w-3" />
                        ) : (
                          <FileSpreadsheet className="h-3 w-3" />
                        )}
                        {report.formato.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{report.tamaño}</td>
                    <td className="px-6 py-4">
                      {report.estado === 'completado' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Listo
                        </span>
                      ) : report.estado === 'procesando' ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                          <Clock className="h-4 w-4 animate-spin" />
                          Procesando
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                          Error
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1 text-accent hover:text-accent/80 text-sm font-medium">
                        <Download className="h-4 w-4" />
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabPanel>

        <TabPanel value="scheduled">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reportes Programados</h3>
            <p className="text-gray-500 mb-4">
              Configura reportes automáticos que se generan periódicamente
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
              <Play className="h-4 w-4" />
              Crear Programación
            </button>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
