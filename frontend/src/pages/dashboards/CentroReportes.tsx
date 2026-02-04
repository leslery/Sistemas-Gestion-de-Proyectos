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
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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

  // Datos de ejemplo para los reportes
  const sampleReportData = {
    portafolio: [
      { proyecto: 'Modernización ERP SAP', estado: 'En Ejecución', avance: '75%', presupuesto: '$850,000', responsable: 'Juan Pérez' },
      { proyecto: 'Automatización Comercial', estado: 'En Revisión', avance: '45%', presupuesto: '$320,000', responsable: 'María García' },
      { proyecto: 'Ciberseguridad Zero Trust', estado: 'En Riesgo', avance: '60%', presupuesto: '$450,000', responsable: 'Carlos López' },
      { proyecto: 'Portal Autoatención', estado: 'En Ejecución', avance: '90%', presupuesto: '$180,000', responsable: 'Ana Martínez' },
    ],
    financiero: [
      { categoria: 'CAPEX Aprobado', monto: '$5,000,000', porcentaje: '100%' },
      { categoria: 'CAPEX Comprometido', monto: '$3,500,000', porcentaje: '70%' },
      { categoria: 'CAPEX Ejecutado', monto: '$2,500,000', porcentaje: '50%' },
      { categoria: 'Disponible', monto: '$1,500,000', porcentaje: '30%' },
    ],
    avance: [
      { proyecto: 'Modernización ERP', planificado: '80%', real: '75%', desviacion: '-5%' },
      { proyecto: 'Migración Cloud', planificado: '50%', real: '60%', desviacion: '+10%' },
      { proyecto: 'Sistema CRM', planificado: '40%', real: '35%', desviacion: '-5%' },
    ],
    gobernanza: [
      { comite: 'Comité de Expertos', fecha: '05-Feb-2026', estado: 'Programado', temas: 4 },
      { comite: 'Comité Inversiones', fecha: '12-Feb-2026', estado: 'Programado', temas: 6 },
      { comite: 'Review Gobernanza', fecha: '19-Feb-2026', estado: 'Programado', temas: 8 },
    ],
    riesgos: [
      { riesgo: 'Retraso en entregas', probabilidad: 'Alta', impacto: 'Alto', mitigacion: 'Seguimiento semanal' },
      { riesgo: 'Sobrecosto', probabilidad: 'Media', impacto: 'Alto', mitigacion: 'Control presupuestario' },
      { riesgo: 'Rotación personal', probabilidad: 'Baja', impacto: 'Medio', mitigacion: 'Plan de retención' },
    ],
    kpis: [
      { indicador: 'Proyectos Activos', valor: '34', tendencia: '+12%' },
      { indicador: 'Cerrados este año', valor: '127', tendencia: '+8%' },
      { indicador: 'En Banco de Reserva', valor: '45', tendencia: '-5%' },
      { indicador: 'Cumplimiento Plan', valor: '89%', tendencia: '+3%' },
    ],
  };

  const generatePDF = (template: ReportTemplate) => {
    const doc = new jsPDF();
    const data = sampleReportData[template.id as keyof typeof sampleReportData] || [];

    // Título
    doc.setFontSize(20);
    doc.setTextColor(26, 54, 93); // Color primario
    doc.text(template.nombre, 20, 20);

    // Subtítulo
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(template.descripcion, 20, 30);

    // Fecha
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}`, 20, 40);

    // Línea separadora
    doc.setDrawColor(26, 54, 93);
    doc.line(20, 45, 190, 45);

    // Contenido de la tabla
    let y = 55;
    doc.setFontSize(11);

    if (data.length > 0) {
      // Headers
      const headers = Object.keys(data[0]);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(26, 54, 93);
      doc.rect(20, y - 5, 170, 8, 'F');

      let x = 22;
      const colWidth = 170 / headers.length;
      headers.forEach((header) => {
        doc.text(header.charAt(0).toUpperCase() + header.slice(1), x, y);
        x += colWidth;
      });

      y += 10;

      // Data rows
      doc.setTextColor(60, 60, 60);
      data.forEach((row: any, index: number) => {
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, y - 5, 170, 8, 'F');
        }

        x = 22;
        Object.values(row).forEach((value) => {
          doc.text(String(value), x, y);
          x += colWidth;
        });
        y += 10;

        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Sistema de Gestión de Iniciativas y Proyectos - CGE Chile', 20, 285);
    doc.text(`Página 1`, 180, 285);

    return doc;
  };

  const generateExcel = (template: ReportTemplate) => {
    const data = sampleReportData[template.id as keyof typeof sampleReportData] || [];

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar anchos de columna
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, template.nombre.substring(0, 31));

    return wb;
  };

  const handleGenerateReport = async (templateId: string, formato: 'pdf' | 'excel') => {
    const template = reportTemplates.find((t) => t.id === templateId);
    if (!template) return;

    setGeneratingReport(`${templateId}-${formato}`);

    // Pequeña pausa para mostrar el loading
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Crear nombre de archivo con: nombre del reporte + fecha + hora
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10); // 2026-02-04
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // 12-45-30

      // Nombre del reporte sin tildes ni caracteres especiales
      const reportName = template.nombre
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar tildes
        .replace(/[^a-zA-Z0-9\s]/g, '') // Solo letras, números y espacios
        .replace(/\s+/g, '_'); // Espacios por guiones bajos

      const fileName = `${reportName}_${dateStr}_${timeStr}`;

      if (formato === 'pdf') {
        const doc = generatePDF(template);
        // Usar método nativo de jsPDF para guardar con extensión .pdf
        doc.save(`${fileName}.pdf`);
      } else {
        const wb = generateExcel(template);
        // Usar método nativo de XLSX para guardar con extensión .xlsx
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      }

      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        nombre: `${template.nombre} - ${new Date().toLocaleDateString('es-CL')}`,
        fecha: new Date().toISOString().split('T')[0],
        formato,
        tamaño: formato === 'pdf' ? '45 KB' : '12 KB',
        estado: 'completado',
      };

      setGeneratedReports((prev) => [newReport, ...prev]);
    } catch (error) {
      console.error('Error generating report:', error);
    }

    setGeneratingReport(null);
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    // Para reportes ya generados, regeneramos el archivo
    const template = reportTemplates.find((t) =>
      report.nombre.toLowerCase().includes(t.nombre.toLowerCase().split(' ')[0])
    );

    if (template) {
      handleGenerateReport(template.id, report.formato);
    }
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
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="inline-flex items-center gap-1 text-accent hover:text-accent/80 text-sm font-medium"
                      >
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
