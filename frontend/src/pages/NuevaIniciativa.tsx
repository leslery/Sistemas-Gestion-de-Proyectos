import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { iniciativasService, usuariosService } from '../services/api';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Input, { Textarea, Select } from '../components/common/Input';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface FormData {
  titulo: string;
  descripcion: string;
  justificacion: string;
  beneficios_esperados: string;
  area_demandante_id: string;
  monto_estimado: string;
  porcentaje_transformacion: string;
  urgencia: string;
}

const steps = [
  { id: 1, name: 'Información Básica' },
  { id: 2, name: 'Justificación' },
  { id: 3, name: 'Estimación' },
  { id: 4, name: 'Confirmación' },
];

export default function NuevaIniciativa() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [areas, setAreas] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      urgencia: 'normal',
      porcentaje_transformacion: '0',
    },
  });

  const formData = watch();

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const data = await usuariosService.getAreas();
      setAreas(data);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        area_demandante_id: parseInt(data.area_demandante_id),
        monto_estimado: parseFloat(data.monto_estimado) || 0,
        porcentaje_transformacion: parseInt(data.porcentaje_transformacion) || 0,
      };

      const result = await iniciativasService.create(payload);
      navigate(`/iniciativas/${result.id}`);
    } catch (error) {
      console.error('Error creating iniciativa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const areaOptions = areas.map((a) => ({ value: a.id.toString(), label: a.nombre }));

  const urgenciaOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' },
  ];

  const formatCurrency = (value: string) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/iniciativas')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Iniciativa</h1>
          <p className="text-gray-500 mt-1">
            Complete el formulario para registrar un nuevo requerimiento digital
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={clsx(
                'flex items-center justify-center w-10 h-10 rounded-full font-medium',
                currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={clsx(
                'ml-3 text-sm font-medium',
                currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
              )}
            >
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'w-24 h-1 mx-4',
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <CardHeader
                title="Información Básica"
                subtitle="Datos generales de la iniciativa"
              />
              <Input
                label="Título de la Iniciativa"
                {...register('titulo', { required: 'El título es requerido' })}
                error={errors.titulo?.message}
                placeholder="Ej: Implementación de sistema de gestión documental"
              />
              <Textarea
                label="Descripción"
                {...register('descripcion', {
                  required: 'La descripción es requerida',
                })}
                error={errors.descripcion?.message}
                placeholder="Describa detalladamente la iniciativa..."
                rows={5}
              />
              <Select
                label="Área Demandante"
                options={areaOptions}
                {...register('area_demandante_id', {
                  required: 'Seleccione un área',
                })}
                error={errors.area_demandante_id?.message}
              />
              <Select
                label="Urgencia"
                options={urgenciaOptions}
                {...register('urgencia')}
              />
            </div>
          )}

          {/* Step 2: Justificación */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <CardHeader
                title="Justificación y Beneficios"
                subtitle="Explique por qué es necesaria esta iniciativa"
              />
              <Textarea
                label="Justificación"
                {...register('justificacion', {
                  required: 'La justificación es requerida',
                })}
                error={errors.justificacion?.message}
                placeholder="Explique el problema o necesidad que resuelve esta iniciativa..."
                rows={5}
              />
              <Textarea
                label="Beneficios Esperados"
                {...register('beneficios_esperados', {
                  required: 'Los beneficios son requeridos',
                })}
                error={errors.beneficios_esperados?.message}
                placeholder="Describa los beneficios cuantificables y cualitativos..."
                rows={5}
              />
            </div>
          )}

          {/* Step 3: Estimación */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <CardHeader
                title="Estimación de Costos"
                subtitle="Información financiera de la iniciativa"
              />
              <Input
                label="Monto Estimado (CLP)"
                type="number"
                {...register('monto_estimado', {
                  required: 'El monto es requerido',
                  min: { value: 0, message: 'El monto debe ser positivo' },
                })}
                error={errors.monto_estimado?.message}
                placeholder="Ej: 50000000"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje de Transformación Digital
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  {...register('porcentaje_transformacion')}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium text-primary-600">
                    {formData.porcentaje_transformacion}%
                  </span>
                  <span>100%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Indique qué porcentaje del proyecto corresponde a transformación
                  digital (desarrollo, automatización, etc.)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmación */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <CardHeader
                title="Confirmación"
                subtitle="Revise la información antes de guardar"
              />
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Título</p>
                    <p className="font-medium">{formData.titulo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Área Demandante</p>
                    <p className="font-medium">
                      {areas.find((a) => a.id.toString() === formData.area_demandante_id)
                        ?.nombre || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monto Estimado</p>
                    <p className="font-medium">
                      {formatCurrency(formData.monto_estimado)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Urgencia</p>
                    <p className="font-medium capitalize">{formData.urgencia}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      % Transformación Digital
                    </p>
                    <p className="font-medium">
                      {formData.porcentaje_transformacion}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Descripción</p>
                  <p className="text-sm mt-1">{formData.descripcion || '-'}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  La iniciativa se guardará como <strong>Borrador</strong>. Podrá
                  editarla y enviarla para revisión posteriormente.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep}>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Iniciativa
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
