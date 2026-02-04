import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluacionesService, iniciativasService } from '../services/api';
import { useAuthStore, isJefeTD } from '../store/authStore';
import Card, { CardHeader } from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input, { Textarea } from '../components/common/Input';
import { PrioridadBadge } from '../components/common/Badge';
import { ClipboardCheck, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Evaluaciones() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIniciativa, setSelectedIniciativa] = useState<any>(null);
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false);
  const [evaluacion, setEvaluacion] = useState({
    dim1_claridad_problema: 0,
    dim1_beneficios_cuantificados: 0,
    dim1_alineacion_estrategica: 0,
    dim2_arquitectura: 0,
    dim2_integracion: 0,
    dim2_seguridad: 0,
    dim2_escalabilidad: 0,
    dim3_presupuesto_detallado: 0,
    dim3_roi_tco: 0,
    dim3_riesgos_financieros: 0,
    veto: false,
    motivo_veto: '',
    observaciones: '',
    recomendaciones: '',
  });

  useEffect(() => {
    loadPendientes();
  }, []);

  const loadPendientes = async () => {
    setIsLoading(true);
    try {
      const data = await evaluacionesService.getPendientes();
      setPendientes(data);
    } catch (error) {
      console.error('Error loading pendientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluar = (iniciativa: any) => {
    setSelectedIniciativa(iniciativa);
    setShowEvaluacionModal(true);
  };

  const handleSubmitEvaluacion = async () => {
    if (!selectedIniciativa) return;

    try {
      await evaluacionesService.create({
        ...evaluacion,
        iniciativa_id: selectedIniciativa.id,
      });
      setShowEvaluacionModal(false);
      loadPendientes();
      // Reset form
      setEvaluacion({
        dim1_claridad_problema: 0,
        dim1_beneficios_cuantificados: 0,
        dim1_alineacion_estrategica: 0,
        dim2_arquitectura: 0,
        dim2_integracion: 0,
        dim2_seguridad: 0,
        dim2_escalabilidad: 0,
        dim3_presupuesto_detallado: 0,
        dim3_roi_tco: 0,
        dim3_riesgos_financieros: 0,
        veto: false,
        motivo_veto: '',
        observaciones: '',
        recomendaciones: '',
      });
    } catch (error) {
      console.error('Error submitting evaluacion:', error);
    }
  };

  const handleCerrarEvaluacion = async (iniciativaId: number) => {
    try {
      await evaluacionesService.cerrar(iniciativaId);
      loadPendientes();
    } catch (error) {
      console.error('Error cerrando evaluacion:', error);
    }
  };

  const calcularTotal = () => {
    const dim1 =
      evaluacion.dim1_claridad_problema +
      evaluacion.dim1_beneficios_cuantificados +
      evaluacion.dim1_alineacion_estrategica;
    const dim2 =
      evaluacion.dim2_arquitectura +
      evaluacion.dim2_integracion +
      evaluacion.dim2_seguridad +
      evaluacion.dim2_escalabilidad;
    const dim3 =
      evaluacion.dim3_presupuesto_detallado +
      evaluacion.dim3_roi_tco +
      evaluacion.dim3_riesgos_financieros;
    return dim1 + dim2 + dim3;
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      render: (item: any) => (
        <span className="font-medium text-primary-600">{item.codigo}</span>
      ),
    },
    {
      key: 'titulo',
      header: 'Título',
      render: (item: any) => (
        <div className="max-w-xs truncate">{item.titulo}</div>
      ),
    },
    {
      key: 'area',
      header: 'Área',
      render: (item: any) => item.area_demandante || '-',
    },
    {
      key: 'monto',
      header: 'Monto',
      render: (item: any) => formatCurrency(item.monto_estimado),
    },
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (item: any) =>
        item.prioridad ? <PrioridadBadge prioridad={item.prioridad} /> : '-',
    },
    {
      key: 'evaluaciones',
      header: 'Evaluaciones',
      render: (item: any) => (
        <span className="text-gray-500">{item.evaluaciones_count} realizadas</span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (item: any) => (
        <div className="flex space-x-2">
          {!item.ya_evaluo && (
            <Button size="sm" onClick={() => handleEvaluar(item)}>
              Evaluar
            </Button>
          )}
          {item.ya_evaluo && (
            <span className="text-green-600 text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Evaluado
            </span>
          )}
          {isJefeTD(user) && item.evaluaciones_count > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCerrarEvaluacion(item.id)}
            >
              Cerrar Evaluación
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Panel de Evaluación del Comité
        </h1>
        <p className="text-gray-500 mt-1">
          Evaluación de factibilidad técnica y económica de iniciativas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <ClipboardCheck className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Pendientes de Evaluar</p>
            <p className="text-2xl font-bold text-gray-900">
              {pendientes.filter((p) => !p.ya_evaluo).length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Evaluadas por Mí</p>
            <p className="text-2xl font-bold text-gray-900">
              {pendientes.filter((p) => p.ya_evaluo).length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ClipboardCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total en Evaluación</p>
            <p className="text-2xl font-bold text-gray-900">{pendientes.length}</p>
          </div>
        </Card>
      </div>

      {/* Tabla */}
      <Card padding="none">
        <Table
          columns={columns}
          data={pendientes}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No hay iniciativas pendientes de evaluación"
        />
      </Card>

      {/* Modal de Evaluación */}
      <Modal
        isOpen={showEvaluacionModal}
        onClose={() => setShowEvaluacionModal(false)}
        title={`Evaluar: ${selectedIniciativa?.titulo}`}
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Dimensión 1 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-4">
              Dimensión 1: Justificación y Beneficios (35 pts)
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <ScoreInput
                label="Claridad del Problema (0-10)"
                value={evaluacion.dim1_claridad_problema}
                max={10}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim1_claridad_problema: v })
                }
              />
              <ScoreInput
                label="Beneficios Cuantificados (0-15)"
                value={evaluacion.dim1_beneficios_cuantificados}
                max={15}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim1_beneficios_cuantificados: v })
                }
              />
              <ScoreInput
                label="Alineación Estratégica (0-10)"
                value={evaluacion.dim1_alineacion_estrategica}
                max={10}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim1_alineacion_estrategica: v })
                }
              />
            </div>
          </div>

          {/* Dimensión 2 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-4">
              Dimensión 2: Solución Técnica (40 pts)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <ScoreInput
                label="Arquitectura (0-15)"
                value={evaluacion.dim2_arquitectura}
                max={15}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim2_arquitectura: v })
                }
              />
              <ScoreInput
                label="Integración (0-10)"
                value={evaluacion.dim2_integracion}
                max={10}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim2_integracion: v })
                }
              />
              <ScoreInput
                label="Seguridad (0-10)"
                value={evaluacion.dim2_seguridad}
                max={10}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim2_seguridad: v })
                }
              />
              <ScoreInput
                label="Escalabilidad (0-5)"
                value={evaluacion.dim2_escalabilidad}
                max={5}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim2_escalabilidad: v })
                }
              />
            </div>
          </div>

          {/* Dimensión 3 */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-4">
              Dimensión 3: Análisis Económico (25 pts)
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <ScoreInput
                label="Presupuesto Detallado (0-10)"
                value={evaluacion.dim3_presupuesto_detallado}
                max={10}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim3_presupuesto_detallado: v })
                }
              />
              <ScoreInput
                label="ROI/TCO (0-10)"
                value={evaluacion.dim3_roi_tco}
                max={10}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim3_roi_tco: v })
                }
              />
              <ScoreInput
                label="Riesgos Financieros (0-5)"
                value={evaluacion.dim3_riesgos_financieros}
                max={5}
                onChange={(v) =>
                  setEvaluacion({ ...evaluacion, dim3_riesgos_financieros: v })
                }
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Puntaje Total:</span>
            <span
              className={`text-2xl font-bold ${
                calcularTotal() >= 80 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {calcularTotal()}/100
            </span>
          </div>

          {/* Veto */}
          <div className="border border-red-200 rounded-lg p-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={evaluacion.veto}
                onChange={(e) =>
                  setEvaluacion({ ...evaluacion, veto: e.target.checked })
                }
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 flex items-center text-red-700 font-medium">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Aplicar VETO (falla crítica identificada)
              </span>
            </label>
            {evaluacion.veto && (
              <Textarea
                label="Motivo del Veto"
                value={evaluacion.motivo_veto}
                onChange={(e) =>
                  setEvaluacion({ ...evaluacion, motivo_veto: e.target.value })
                }
                placeholder="Describa la falla crítica identificada..."
                className="mt-3"
                required
              />
            )}
          </div>

          {/* Observaciones */}
          <Textarea
            label="Observaciones"
            value={evaluacion.observaciones}
            onChange={(e) =>
              setEvaluacion({ ...evaluacion, observaciones: e.target.value })
            }
            placeholder="Observaciones adicionales..."
          />

          <Textarea
            label="Recomendaciones"
            value={evaluacion.recomendaciones}
            onChange={(e) =>
              setEvaluacion({ ...evaluacion, recomendaciones: e.target.value })
            }
            placeholder="Recomendaciones para el proyecto..."
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowEvaluacionModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitEvaluacion}>Enviar Evaluación</Button>
        </div>
      </Modal>
    </div>
  );
}

function ScoreInput({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Math.min(Math.max(0, parseInt(e.target.value) || 0), max);
          onChange(v);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  );
}
