import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Save,
  Send,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import { FileUpload } from '../../components/ui/FileUpload';

interface IngresoExtraordinarioForm {
  titulo: string;
  descripcion: string;
  justificacion: string;
  tipoUrgencia: 'regulatoria' | 'critica_negocio' | 'emergencia' | 'oportunidad';
  fechaLimite: string;
  montoEstimado: number;
  impactoNoEjecucion: string;
  areaSolicitante: string;
  patrocinador: string;
  documentosRespaldo: File[];
}

export default function IngresoExtraordinario() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<IngresoExtraordinarioForm>({
    titulo: '',
    descripcion: '',
    justificacion: '',
    tipoUrgencia: 'critica_negocio',
    fechaLimite: '',
    montoEstimado: 0,
    impactoNoEjecucion: '',
    areaSolicitante: '',
    patrocinador: '',
    documentosRespaldo: [],
  });

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsLoading(true);
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    if (!isDraft) {
      navigate('/iniciativas');
    }
  };

  const urgenciaOptions = [
    { value: 'regulatoria', label: 'Regulatoria', description: 'Cumplimiento normativo obligatorio', color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'critica_negocio', label: 'Crítica de Negocio', description: 'Impacto significativo en operaciones', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { value: 'emergencia', label: 'Emergencia', description: 'Situación imprevista urgente', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'oportunidad', label: 'Oportunidad', description: 'Ventana de oportunidad limitada', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-7 w-7 text-amber-500" />
            Ingreso Extraordinario
          </h1>
          <p className="text-gray-500 mt-1">Solicitud de iniciativa fuera del ciclo regular</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            Guardar Borrador
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Send className="h-4 w-4" />
            Enviar Solicitud
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Proceso de Ingreso Extraordinario</p>
          <p className="text-sm text-amber-700 mt-1">
            Este formulario es para iniciativas que requieren activación urgente fuera del ciclo de planificación regular.
            Debe contar con justificación sólida y aprobación ejecutiva.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              Información General
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la Iniciativa *
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  placeholder="Ej: Actualización Sistema Facturación Electrónica"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  placeholder="Describa en qué consiste la iniciativa..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área Solicitante *
                  </label>
                  <select
                    value={form.areaSolicitante}
                    onChange={(e) => setForm({ ...form, areaSolicitante: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  >
                    <option value="">Seleccionar área</option>
                    <option value="ti">TI</option>
                    <option value="operaciones">Operaciones</option>
                    <option value="comercial">Comercial</option>
                    <option value="finanzas">Finanzas</option>
                    <option value="rrhh">RRHH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patrocinador Ejecutivo *
                  </label>
                  <input
                    type="text"
                    value={form.patrocinador}
                    onChange={(e) => setForm({ ...form, patrocinador: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                    placeholder="Nombre del patrocinador"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Urgencia y Justificación */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-400" />
              Urgencia y Justificación
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Urgencia *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {urgenciaOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setForm({ ...form, tipoUrgencia: option.value as any })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        form.tipoUrgencia === option.value
                          ? option.color
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs mt-0.5 opacity-80">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justificación Detallada *
                </label>
                <textarea
                  value={form.justificacion}
                  onChange={(e) => setForm({ ...form, justificacion: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  placeholder="Explique por qué esta iniciativa no puede esperar al ciclo regular de planificación..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impacto de No Ejecución *
                </label>
                <textarea
                  value={form.impactoNoEjecucion}
                  onChange={(e) => setForm({ ...form, impactoNoEjecucion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  placeholder="Describa las consecuencias si esta iniciativa no se ejecuta a tiempo..."
                />
              </div>
            </div>
          </div>

          {/* Documentos de Respaldo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos de Respaldo</h3>
            <FileUpload
              onUpload={async (files) => {
                setForm({ ...form, documentosRespaldo: [...form.documentosRespaldo, ...files] });
              }}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              maxSize={10}
              maxFiles={5}
            />
            <p className="text-xs text-gray-500 mt-2">
              Adjunte documentos que respalden la urgencia: normativas, comunicados, análisis de impacto, etc.
            </p>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Datos Financieros */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              Datos Financieros
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Estimado (CLP)
                </label>
                <input
                  type="number"
                  value={form.montoEstimado}
                  onChange={(e) => setForm({ ...form, montoEstimado: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              Fechas Críticas
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Límite de Implementación
              </label>
              <input
                type="date"
                value={form.fechaLimite}
                onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fecha máxima para tener el proyecto operativo
              </p>
            </div>
          </div>

          {/* Flujo de Aprobación */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-amber-800 mb-3">Flujo de Aprobación</h3>
            <ol className="space-y-3 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                <span>Revisión por Jefe TD</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                <span>Validación Ejecutiva (Patrocinador)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                <span>Aprobación Comité Ejecutivo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                <span>Activación Inmediata</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
