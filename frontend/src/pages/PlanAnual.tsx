import { useEffect, useState } from 'react';
import { planificacionService, proyectosService } from '../services/api';
import { useAuthStore, isCGEDx } from '../store/authStore';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { SemaforoBadge, PrioridadBadge } from '../components/common/Badge';
import Badge from '../components/common/Badge';
import {
  Calendar,
  Plus,
  Check,
  Trash2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function PlanAnual() {
  const { user } = useAuthStore();
  const [planes, setPlanes] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [planActual, setPlanActual] = useState<any>(null);
  const [bancoReserva, setBancoReserva] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ nombre: '', presupuesto_total: '' });
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [montoAsignar, setMontoAsignar] = useState('');

  useEffect(() => {
    loadPlanes();
  }, []);

  useEffect(() => {
    loadPlanActual();
    loadBancoReserva();
  }, [selectedYear]);

  const loadPlanes = async () => {
    try {
      const data = await planificacionService.getPlanes();
      setPlanes(data);
    } catch (error) {
      console.error('Error loading planes:', error);
    }
  };

  const loadPlanActual = async () => {
    setIsLoading(true);
    try {
      const data = await planificacionService.getPlan(selectedYear);
      setPlanActual(data);
    } catch (error) {
      setPlanActual(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBancoReserva = async () => {
    try {
      const data = await proyectosService.getBancoReserva();
      setBancoReserva(data);
    } catch (error) {
      console.error('Error loading banco reserva:', error);
    }
  };

  const handleCrearPlan = async () => {
    try {
      await planificacionService.crearPlan({
        año: selectedYear,
        nombre: newPlan.nombre || `Plan Anual ${selectedYear}`,
        presupuesto_total: parseFloat(newPlan.presupuesto_total),
      });
      setShowNewPlanModal(false);
      setNewPlan({ nombre: '', presupuesto_total: '' });
      loadPlanActual();
      loadPlanes();
    } catch (error) {
      console.error('Error creando plan:', error);
    }
  };

  const handleAgregarProyecto = async () => {
    if (!selectedProject || !montoAsignar) return;
    try {
      await planificacionService.agregarProyecto(
        selectedYear,
        selectedProject.id,
        parseFloat(montoAsignar)
      );
      setShowAddProjectModal(false);
      setSelectedProject(null);
      setMontoAsignar('');
      loadPlanActual();
      loadBancoReserva();
    } catch (error) {
      console.error('Error agregando proyecto:', error);
    }
  };

  const handleQuitarProyecto = async (proyectoId: number) => {
    try {
      await planificacionService.quitarProyecto(selectedYear, proyectoId);
      loadPlanActual();
      loadBancoReserva();
    } catch (error) {
      console.error('Error quitando proyecto:', error);
    }
  };

  const handleAprobarPlan = async () => {
    try {
      await planificacionService.aprobarPlan(selectedYear);
      loadPlanActual();
    } catch (error) {
      console.error('Error aprobando plan:', error);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);

  const porcentajeComprometido = planActual
    ? (planActual.presupuesto_comprometido / planActual.presupuesto_total) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Plan Anual de Digitalización
          </h1>
          <p className="text-gray-500 mt-1">
            Planificación y asignación presupuestaria de proyectos
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {!planActual && (
            <Button onClick={() => setShowNewPlanModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Plan {selectedYear}
            </Button>
          )}
        </div>
      </div>

      {/* Plan actual */}
      {planActual ? (
        <>
          {/* Stats del plan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Presupuesto Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(planActual.presupuesto_total)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Comprometido</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(planActual.presupuesto_comprometido)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Disponible</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(planActual.presupuesto_disponible)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Proyectos</p>
                  <p className="text-xl font-bold text-gray-900">
                    {planActual.proyectos?.length || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Barra de progreso */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Presupuesto Comprometido</span>
              <span className="text-sm font-medium">
                {porcentajeComprometido.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  porcentajeComprometido > 90
                    ? 'bg-red-500'
                    : porcentajeComprometido > 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(porcentajeComprometido, 100)}%` }}
              />
            </div>
          </Card>

          {/* Estado y acciones del plan */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge
                  variant={
                    planActual.estado === 'aprobado'
                      ? 'success'
                      : planActual.estado === 'borrador'
                      ? 'default'
                      : 'warning'
                  }
                >
                  {planActual.estado.toUpperCase()}
                </Badge>
                {planActual.fecha_aprobacion && (
                  <span className="text-sm text-gray-500">
                    Aprobado el{' '}
                    {new Date(planActual.fecha_aprobacion).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {planActual.estado !== 'aprobado' && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setShowAddProjectModal(true)}
                      disabled={bancoReserva.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Proyecto
                    </Button>
                    {isCGEDx(user) && planActual.proyectos?.length > 0 && (
                      <Button onClick={handleAprobarPlan}>
                        <Check className="h-4 w-4 mr-2" />
                        Aprobar Plan
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Lista de proyectos del plan */}
          <Card>
            <CardHeader title="Proyectos del Plan" />
            {planActual.proyectos && planActual.proyectos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Prioridad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Área
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Monto Asignado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {planActual.proyectos.map((p: any) => (
                      <tr key={p.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {p.prioridad_iniciativa ? (
                            <PrioridadBadge prioridad={p.prioridad_iniciativa} />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-primary-600">
                          {p.codigo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{p.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {p.area || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(p.monto_asignado)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <SemaforoBadge semaforo={p.semaforo} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {planActual.estado !== 'aprobado' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuitarProyecto(p.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No hay proyectos en el plan. Agregue proyectos desde el Banco de Reserva.
              </p>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No existe un plan para {selectedYear}
            </h3>
            <p className="text-gray-500 mt-2">
              Cree un nuevo plan anual para comenzar a asignar proyectos
            </p>
            <Button className="mt-4" onClick={() => setShowNewPlanModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Plan {selectedYear}
            </Button>
          </div>
        </Card>
      )}

      {/* Modal Nuevo Plan */}
      <Modal
        isOpen={showNewPlanModal}
        onClose={() => setShowNewPlanModal(false)}
        title={`Crear Plan Anual ${selectedYear}`}
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Plan"
            value={newPlan.nombre}
            onChange={(e) => setNewPlan({ ...newPlan, nombre: e.target.value })}
            placeholder={`Plan Anual de Digitalización ${selectedYear}`}
          />
          <Input
            label="Presupuesto Total (CLP)"
            type="number"
            value={newPlan.presupuesto_total}
            onChange={(e) =>
              setNewPlan({ ...newPlan, presupuesto_total: e.target.value })
            }
            placeholder="1000000000"
            required
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowNewPlanModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCrearPlan}>Crear Plan</Button>
        </div>
      </Modal>

      {/* Modal Agregar Proyecto */}
      <Modal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        title="Agregar Proyecto al Plan"
        size="lg"
      >
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {bancoReserva.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProject(p);
                  setMontoAsignar(p.presupuesto_asignado?.toString() || '');
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedProject?.id === p.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{p.codigo_proyecto}</span>
                    <span className="mx-2">-</span>
                    <span>{p.nombre}</span>
                  </div>
                  {p.iniciativa?.prioridad && (
                    <PrioridadBadge prioridad={p.iniciativa.prioridad} />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Presupuesto estimado: {formatCurrency(p.presupuesto_asignado || 0)}
                </p>
              </div>
            ))}
          </div>

          {selectedProject && (
            <Input
              label="Monto a Asignar (CLP)"
              type="number"
              value={montoAsignar}
              onChange={(e) => setMontoAsignar(e.target.value)}
              helperText={`Disponible en el plan: ${formatCurrency(
                planActual?.presupuesto_disponible || 0
              )}`}
            />
          )}
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAddProjectModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAgregarProyecto} disabled={!selectedProject}>
            Agregar al Plan
          </Button>
        </div>
      </Modal>
    </div>
  );
}
