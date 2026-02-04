import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { iniciativasService, evaluacionesService } from '../services/api';
import { useAuthStore, isJefeTD, isComite } from '../store/authStore';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import { EstadoBadge, PrioridadBadge } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { Select } from '../components/common/Input';
import WorkflowTimeline from '../components/workflow/WorkflowTimeline';
import { Iniciativa, EvaluacionComite } from '../types';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  DollarSign,
  GitBranch,
} from 'lucide-react';

export default function IniciativaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [iniciativa, setIniciativa] = useState<Iniciativa | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionComite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [scoringData, setScoringData] = useState({
    dim_a_focos: 0,
    dim_a_profundidad: 0,
    dim_b_beneficio: 0,
    dim_b_alcance: 0,
    dim_c_urgencia: 0,
    dim_c_viabilidad: 0,
  });

  useEffect(() => {
    loadIniciativa();
  }, [id]);

  const loadIniciativa = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await iniciativasService.getById(parseInt(id));
      setIniciativa(data);

      // Cargar evaluaciones si está en evaluación
      if (data.estado === 'en_evaluacion' || data.estado === 'aprobada') {
        const evals = await evaluacionesService.getByIniciativa(parseInt(id));
        setEvaluaciones(evals);
      }
    } catch (error) {
      console.error('Error loading iniciativa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnviar = async () => {
    if (!id) return;
    try {
      await iniciativasService.enviar(parseInt(id));
      loadIniciativa();
    } catch (error) {
      console.error('Error enviando iniciativa:', error);
    }
  };

  const handleAprobarRevision = async () => {
    if (!id) return;
    try {
      await iniciativasService.aprobarRevision(parseInt(id));
      loadIniciativa();
    } catch (error) {
      console.error('Error aprobando revisión:', error);
    }
  };

  const handleCalcScoring = async () => {
    if (!id) return;
    try {
      await iniciativasService.calcularScoring(parseInt(id), scoringData);
      setShowScoringModal(false);
      loadIniciativa();
    } catch (error) {
      console.error('Error calculando scoring:', error);
    }
  };

  const scoringTotal =
    scoringData.dim_a_focos + scoringData.dim_a_profundidad +
    scoringData.dim_b_beneficio + scoringData.dim_b_alcance +
    scoringData.dim_c_urgencia + scoringData.dim_c_viabilidad;

  const getPrioridadFromScore = (score: number) => {
    if (score >= 32) return 'P1';
    if (score >= 24) return 'P2';
    if (score >= 16) return 'P3';
    if (score >= 11) return 'P4';
    return 'P5';
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!iniciativa) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Iniciativa no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/iniciativas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {iniciativa.codigo}
              </h1>
              <EstadoBadge estado={iniciativa.estado} />
              {iniciativa.prioridad && (
                <PrioridadBadge prioridad={iniciativa.prioridad} />
              )}
            </div>
            <p className="text-gray-500 mt-1">{iniciativa.titulo}</p>
          </div>
        </div>

        {/* Acciones según estado */}
        <div className="flex space-x-2">
          {iniciativa.estado === 'borrador' && (
            <Button onClick={handleEnviar}>
              <Send className="h-4 w-4 mr-2" />
              Enviar para Revisión
            </Button>
          )}
          {iniciativa.estado === 'en_revision' && isJefeTD(user) && (
            <>
              <Button variant="secondary" onClick={() => setShowScoringModal(true)}>
                Calcular Scoring
              </Button>
              <Button onClick={handleAprobarRevision}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar y Enviar a Evaluación
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Timeline del Workflow */}
      <Card>
        <CardHeader title="Flujo de Activación" icon={<GitBranch className="h-5 w-5 text-primary-500" />} />
        <WorkflowTimeline iniciativaId={iniciativa.id} estadoActual={iniciativa.estado} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Descripción" />
            <p className="text-gray-700 whitespace-pre-wrap">
              {iniciativa.descripcion}
            </p>
          </Card>

          {iniciativa.justificacion && (
            <Card>
              <CardHeader title="Justificación" />
              <p className="text-gray-700 whitespace-pre-wrap">
                {iniciativa.justificacion}
              </p>
            </Card>
          )}

          {iniciativa.beneficios_esperados && (
            <Card>
              <CardHeader title="Beneficios Esperados" />
              <p className="text-gray-700 whitespace-pre-wrap">
                {iniciativa.beneficios_esperados}
              </p>
            </Card>
          )}

          {/* Scoring */}
          {iniciativa.scoring && (
            <Card>
              <CardHeader title="Scoring de Priorización" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">
                      Dimensión A: Impacto Estratégico
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {iniciativa.scoring.dim_a_focos + iniciativa.scoring.dim_a_profundidad}/12
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">
                      Dimensión B: Impacto Operacional
                    </h4>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {iniciativa.scoring.dim_b_beneficio + iniciativa.scoring.dim_b_alcance}/10
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900">
                      Dimensión C: Urgencia y Viabilidad
                    </h4>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                      {iniciativa.scoring.dim_c_urgencia + iniciativa.scoring.dim_c_viabilidad}/16
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Puntaje Total</h4>
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                      {iniciativa.scoring.puntaje_total}/38
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Evaluaciones del Comité */}
          {evaluaciones.length > 0 && (
            <Card>
              <CardHeader title="Evaluaciones del Comité" />
              <div className="space-y-4">
                {evaluaciones.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{ev.evaluador_nombre}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          ev.aprobado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ev.aprobado ? 'Aprobado' : 'No Aprobado'}
                        {ev.veto && ' (VETO)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Justificación:</span>
                        <span className="ml-2 font-medium">{Number(ev.dim1_subtotal).toFixed(1)}/35</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Solución:</span>
                        <span className="ml-2 font-medium">{Number(ev.dim2_subtotal).toFixed(1)}/40</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Económico:</span>
                        <span className="ml-2 font-medium">{Number(ev.dim3_subtotal).toFixed(1)}/25</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-2 font-bold">{Number(ev.puntaje_total).toFixed(1)}/100</span>
                      </div>
                    </div>
                    {ev.observaciones && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>Observaciones:</strong> {ev.observaciones}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Detalles" />
            <div className="space-y-4">
              <InfoItem
                icon={User}
                label="Solicitante"
                value={iniciativa.creador_nombre || '-'}
              />
              <InfoItem
                icon={FileText}
                label="Área"
                value={iniciativa.area_demandante_nombre || '-'}
              />
              <InfoItem
                icon={Calendar}
                label="Fecha Solicitud"
                value={new Date(iniciativa.fecha_solicitud).toLocaleDateString(
                  'es-CL'
                )}
              />
              <InfoItem
                icon={DollarSign}
                label="Monto Estimado"
                value={formatCurrency(iniciativa.monto_estimado)}
              />
              {iniciativa.clasificacion_inversion && (
                <InfoItem
                  icon={FileText}
                  label="Clasificación"
                  value={iniciativa.clasificacion_inversion.replace('_', ' ').toUpperCase()}
                />
              )}
              {iniciativa.tipo_informe && (
                <InfoItem
                  icon={FileText}
                  label="Tipo Informe"
                  value={iniciativa.tipo_informe}
                />
              )}
            </div>
          </Card>

          {/* Timeline de estados podría ir aquí */}
        </div>
      </div>

      {/* Modal de Scoring */}
      <Modal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        title="Calcular Scoring de Priorización"
      >
        <div className="space-y-6">
          {/* Dimensión A: Impacto Estratégico (0-12 puntos) */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">
              Dimensión A: Impacto Estratégico (máx 12 pts)
            </h4>
            <div className="space-y-3">
              <Select
                label="Focos Estratégicos (0-6 pts)"
                value={scoringData.dim_a_focos.toString()}
                onChange={(e) => setScoringData({ ...scoringData, dim_a_focos: parseInt(e.target.value) })}
                options={[
                  { value: '0', label: '0 - No alineado' },
                  { value: '2', label: '2 - Alineación baja' },
                  { value: '4', label: '4 - Alineación media' },
                  { value: '6', label: '6 - Alineación alta' },
                ]}
              />
              <Select
                label="Profundidad del Impacto (0-6 pts)"
                value={scoringData.dim_a_profundidad.toString()}
                onChange={(e) => setScoringData({ ...scoringData, dim_a_profundidad: parseInt(e.target.value) })}
                options={[
                  { value: '0', label: '0 - Sin impacto' },
                  { value: '2', label: '2 - Impacto limitado' },
                  { value: '4', label: '4 - Impacto moderado' },
                  { value: '6', label: '6 - Impacto significativo' },
                ]}
              />
            </div>
            <p className="mt-2 text-sm text-blue-700">
              Subtotal: {scoringData.dim_a_focos + scoringData.dim_a_profundidad}/12
            </p>
          </div>

          {/* Dimensión B: Impacto Operacional (0-10 puntos) */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3">
              Dimensión B: Impacto Operacional (máx 10 pts)
            </h4>
            <div className="space-y-3">
              <Select
                label="Beneficio Esperado (0-5 pts)"
                value={scoringData.dim_b_beneficio.toString()}
                onChange={(e) => setScoringData({ ...scoringData, dim_b_beneficio: parseInt(e.target.value) })}
                options={[
                  { value: '0', label: '0 - Sin beneficio claro' },
                  { value: '1', label: '1 - Beneficio mínimo' },
                  { value: '2', label: '2 - Beneficio bajo' },
                  { value: '3', label: '3 - Beneficio moderado' },
                  { value: '4', label: '4 - Beneficio alto' },
                  { value: '5', label: '5 - Beneficio muy alto' },
                ]}
              />
              <Select
                label="Alcance Organizacional (0-5 pts)"
                value={scoringData.dim_b_alcance.toString()}
                onChange={(e) => setScoringData({ ...scoringData, dim_b_alcance: parseInt(e.target.value) })}
                options={[
                  { value: '0', label: '0 - Individual' },
                  { value: '1', label: '1 - Equipo' },
                  { value: '2', label: '2 - Departamento' },
                  { value: '3', label: '3 - Área' },
                  { value: '4', label: '4 - Multi-área' },
                  { value: '5', label: '5 - Toda la organización' },
                ]}
              />
            </div>
            <p className="mt-2 text-sm text-green-700">
              Subtotal: {scoringData.dim_b_beneficio + scoringData.dim_b_alcance}/10
            </p>
          </div>

          {/* Dimensión C: Urgencia y Viabilidad (0-16 puntos) */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-3">
              Dimensión C: Urgencia y Viabilidad (máx 16 pts)
            </h4>
            <div className="space-y-3">
              <Select
                label="Urgencia (0-8 pts)"
                value={scoringData.dim_c_urgencia.toString()}
                onChange={(e) => setScoringData({ ...scoringData, dim_c_urgencia: parseInt(e.target.value) })}
                options={[
                  { value: '0', label: '0 - Sin urgencia' },
                  { value: '2', label: '2 - Baja urgencia' },
                  { value: '4', label: '4 - Urgencia moderada' },
                  { value: '6', label: '6 - Alta urgencia' },
                  { value: '8', label: '8 - Urgencia crítica' },
                ]}
              />
              <Select
                label="Viabilidad Técnica (0-8 pts)"
                value={scoringData.dim_c_viabilidad.toString()}
                onChange={(e) => setScoringData({ ...scoringData, dim_c_viabilidad: parseInt(e.target.value) })}
                options={[
                  { value: '0', label: '0 - No viable' },
                  { value: '2', label: '2 - Viabilidad baja' },
                  { value: '4', label: '4 - Viabilidad moderada' },
                  { value: '6', label: '6 - Alta viabilidad' },
                  { value: '8', label: '8 - Totalmente viable' },
                ]}
              />
            </div>
            <p className="mt-2 text-sm text-yellow-700">
              Subtotal: {scoringData.dim_c_urgencia + scoringData.dim_c_viabilidad}/16
            </p>
          </div>

          {/* Total y Prioridad */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900">Puntaje Total</h4>
                <p className="text-3xl font-bold text-purple-600">{scoringTotal}/38</p>
              </div>
              <div className="text-right">
                <h4 className="font-medium text-purple-900">Prioridad Calculada</h4>
                <p className="text-3xl font-bold text-purple-600">{getPrioridadFromScore(scoringTotal)}</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-purple-700">
              <p>P1: 32-38 pts | P2: 24-31 pts | P3: 16-23 pts | P4: 11-15 pts | P5: 0-10 pts</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowScoringModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCalcScoring}>Guardar Scoring</Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start">
      <Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
