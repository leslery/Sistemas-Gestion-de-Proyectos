import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proyectosService, presupuestoService } from '../services/api';
import { useAuthStore, isJefeTD } from '../store/authStore';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import { SemaforoBadge } from '../components/common/Badge';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { Select } from '../components/common/Input';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Plus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [proyecto, setProyecto] = useState<any>(null);
  const [curvaS, setCurvaS] = useState<any>(null);
  const [riesgos, setRiesgos] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [bitacora, setBitacora] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  // Modal states
  const [showFaseModal, setShowFaseModal] = useState(false);
  const [showRiesgoModal, setShowRiesgoModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showBitacoraModal, setShowBitacoraModal] = useState(false);

  // Form states
  const [newFase, setNewFase] = useState({
    nombre: '',
    descripcion: '',
    orden: 1,
  });
  const [newRiesgo, setNewRiesgo] = useState({
    descripcion: '',
    probabilidad: 'medio',
    impacto: 'medio',
    mitigacion: '',
  });
  const [newIssue, setNewIssue] = useState({
    titulo: '',
    descripcion: '',
    severidad: 'media',
  });
  const [newBitacora, setNewBitacora] = useState({
    tipo: 'nota',
    descripcion: '',
  });

  // Mock data for demo when API fails
  const getMockProyecto = () => ({
    id: id,
    codigo_proyecto: 'PRY-2026-001',
    nombre: 'Modernización ERP SAP S/4HANA',
    descripcion: 'Proyecto de modernización del sistema ERP corporativo migrando a SAP S/4HANA Cloud, incluyendo rediseño de procesos financieros, logísticos y de recursos humanos.',
    estado: 'en_ejecucion',
    semaforo_salud: 'verde',
    avance_porcentaje: 65,
    presupuesto_asignado: 850000000,
    año_plan: 2026,
    area_demandante_nombre: 'Tecnología de la Información',
    fecha_activacion: '2025-03-01',
    fases: [
      { id: 1, nombre: 'Planificación', estado: 'completada', avance_porcentaje: 100 },
      { id: 2, nombre: 'Análisis y Diseño', estado: 'completada', avance_porcentaje: 100 },
      { id: 3, nombre: 'Construcción', estado: 'en_progreso', avance_porcentaje: 60 },
      { id: 4, nombre: 'Pruebas', estado: 'pendiente', avance_porcentaje: 0 },
      { id: 5, nombre: 'Transición', estado: 'pendiente', avance_porcentaje: 0 },
      { id: 6, nombre: 'Go Live', estado: 'pendiente', avance_porcentaje: 0 },
    ],
  });

  const getMockCurvaS = () => ({
    capex_aprobado: 850000000,
    total_ejecutado: 510000000,
    variacion_costo_porcentaje: 5.2,
    datos: [
      { periodo: 'Mar-25', planificado_acumulado: 50000000, ejecutado_acumulado: 45000000 },
      { periodo: 'Jun-25', planificado_acumulado: 150000000, ejecutado_acumulado: 140000000 },
      { periodo: 'Sep-25', planificado_acumulado: 300000000, ejecutado_acumulado: 310000000 },
      { periodo: 'Dic-25', planificado_acumulado: 500000000, ejecutado_acumulado: 510000000 },
      { periodo: 'Mar-26', planificado_acumulado: 650000000, ejecutado_acumulado: null },
      { periodo: 'Jun-26', planificado_acumulado: 850000000, ejecutado_acumulado: null },
    ],
  });

  const getMockRiesgos = () => [
    { id: 1, descripcion: 'Retraso en entrega de módulo financiero por proveedor', probabilidad: 'medio', impacto: 'alto', estado: 'abierto', mitigacion: 'Seguimiento semanal con proveedor y plan de contingencia alternativo' },
    { id: 2, descripcion: 'Resistencia al cambio por usuarios finales', probabilidad: 'alto', impacto: 'medio', estado: 'abierto', mitigacion: 'Plan de gestión del cambio y capacitaciones tempranas' },
  ];

  const getMockIssues = () => [
    { id: 1, titulo: 'Error en migración de datos históricos', descripcion: 'Se detectaron inconsistencias en la migración de transacciones del año 2023', severidad: 'alta', estado: 'abierto' },
  ];

  const getMockBitacora = () => [
    { id: 1, fecha: '2026-01-15', tipo: 'decision', descripcion: 'Se aprobó extensión de fase de construcción por 2 semanas', usuario_nombre: 'Juan Pérez' },
    { id: 2, fecha: '2026-01-10', tipo: 'nota', descripcion: 'Reunión de seguimiento con stakeholders - avance satisfactorio', usuario_nombre: 'María García' },
  ];

  useEffect(() => {
    if (id) loadProyecto();
  }, [id]);

  const loadProyecto = async () => {
    setIsLoading(true);
    try {
      const numericId = parseInt(id!);
      if (isNaN(numericId)) {
        // Use mock data for non-numeric IDs (demo mode)
        setProyecto(getMockProyecto());
        setCurvaS(getMockCurvaS());
        setRiesgos(getMockRiesgos());
        setIssues(getMockIssues());
        setBitacora(getMockBitacora());
        setIsLoading(false);
        return;
      }

      const data = await proyectosService.getById(numericId);
      setProyecto(data);

      // Cargar datos adicionales
      const [curva, riesgosData, issuesData, bitacoraData] = await Promise.all([
        presupuestoService.getCurvaS(numericId).catch(() => getMockCurvaS()),
        proyectosService.getRiesgos(numericId).catch(() => getMockRiesgos()),
        proyectosService.getIssues(numericId).catch(() => getMockIssues()),
        proyectosService.getBitacora(numericId).catch(() => getMockBitacora()),
      ]);

      setCurvaS(curva);
      setRiesgos(riesgosData);
      setIssues(issuesData);
      setBitacora(bitacoraData);
    } catch (error) {
      console.error('Error loading proyecto:', error);
      // Use mock data on error
      setProyecto(getMockProyecto());
      setCurvaS(getMockCurvaS());
      setRiesgos(getMockRiesgos());
      setIssues(getMockIssues());
      setBitacora(getMockBitacora());
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivar = async () => {
    try {
      await proyectosService.activar(parseInt(id!));
      loadProyecto();
    } catch (error) {
      console.error('Error activando proyecto:', error);
    }
  };

  const handleCerrar = async () => {
    try {
      await proyectosService.cerrar(parseInt(id!));
      loadProyecto();
    } catch (error) {
      console.error('Error cerrando proyecto:', error);
    }
  };

  const handleCreateFase = async () => {
    if (!newFase.nombre) return;
    try {
      await proyectosService.crearFase(parseInt(id!), {
        ...newFase,
        proyecto_id: parseInt(id!),
      });
      setShowFaseModal(false);
      setNewFase({ nombre: '', descripcion: '', orden: 1 });
      loadProyecto();
    } catch (error) {
      console.error('Error creando fase:', error);
    }
  };

  const handleCreateRiesgo = async () => {
    if (!newRiesgo.descripcion) return;
    try {
      await proyectosService.crearRiesgo(parseInt(id!), {
        ...newRiesgo,
        proyecto_id: parseInt(id!),
      });
      setShowRiesgoModal(false);
      setNewRiesgo({ descripcion: '', probabilidad: 'medio', impacto: 'medio', mitigacion: '' });
      const riesgosData = await proyectosService.getRiesgos(parseInt(id!));
      setRiesgos(riesgosData);
    } catch (error) {
      console.error('Error creando riesgo:', error);
    }
  };

  const handleCreateIssue = async () => {
    if (!newIssue.titulo || !newIssue.descripcion) return;
    try {
      await proyectosService.crearIssue(parseInt(id!), {
        ...newIssue,
        proyecto_id: parseInt(id!),
      });
      setShowIssueModal(false);
      setNewIssue({ titulo: '', descripcion: '', severidad: 'media' });
      const issuesData = await proyectosService.getIssues(parseInt(id!));
      setIssues(issuesData);
    } catch (error) {
      console.error('Error creando issue:', error);
    }
  };

  const handleCreateBitacora = async () => {
    if (!newBitacora.descripcion) return;
    try {
      await proyectosService.crearBitacora(parseInt(id!), {
        ...newBitacora,
        proyecto_id: parseInt(id!),
      });
      setShowBitacoraModal(false);
      setNewBitacora({ tipo: 'nota', descripcion: '' });
      const bitacoraData = await proyectosService.getBitacora(parseInt(id!));
      setBitacora(bitacoraData);
    } catch (error) {
      console.error('Error creando entrada bitácora:', error);
    }
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

  if (!proyecto) return null;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'fases', label: 'Fases' },
    { id: 'presupuesto', label: 'Presupuesto' },
    { id: 'riesgos', label: `Riesgos (${riesgos.length})` },
    { id: 'issues', label: `Issues (${issues.length})` },
    { id: 'bitacora', label: 'Bitácora' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/proyectos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {proyecto.codigo_proyecto}
              </h1>
              <SemaforoBadge semaforo={proyecto.semaforo_salud} />
            </div>
            <p className="text-gray-500 mt-1">{proyecto.nombre}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          {proyecto.estado === 'banco_reserva' && isJefeTD(user) && (
            <Button onClick={handleActivar}>
              <Play className="h-4 w-4 mr-2" />
              Activar Proyecto
            </Button>
          )}
          {proyecto.estado === 'en_ejecucion' && isJefeTD(user) && (
            <Button variant="success" onClick={handleCerrar}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Cerrar Proyecto
            </Button>
          )}
        </div>
      </div>

      {/* Avance General */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Avance del Proyecto</h3>
          <span className="text-2xl font-bold text-primary-600">
            {proyecto.avance_porcentaje}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-primary-600 h-4 rounded-full transition-all"
            style={{ width: `${proyecto.avance_porcentaje}%` }}
          />
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Información General" />
            <div className="space-y-4">
              <InfoRow icon={FileText} label="Estado" value={proyecto.estado} />
              <InfoRow
                icon={Calendar}
                label="Año Plan"
                value={proyecto.año_plan || '-'}
              />
              <InfoRow
                icon={DollarSign}
                label="Presupuesto"
                value={formatCurrency(proyecto.presupuesto_asignado)}
              />
              <InfoRow
                icon={Users}
                label="Área"
                value={proyecto.area_demandante_nombre || '-'}
              />
              <InfoRow
                icon={Calendar}
                label="Fecha Activación"
                value={
                  proyecto.fecha_activacion
                    ? new Date(proyecto.fecha_activacion).toLocaleDateString()
                    : '-'
                }
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Descripción" />
            <p className="text-gray-700">{proyecto.descripcion || '-'}</p>
          </Card>
        </div>
      )}

      {activeTab === 'fases' && (
        <Card>
          <CardHeader
            title="Fases del Proyecto"
            action={
              <Button size="sm" onClick={() => setShowFaseModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Fase
              </Button>
            }
          />
          {proyecto.fases && proyecto.fases.length > 0 ? (
            <div className="space-y-4">
              {proyecto.fases.map((fase: any) => (
                <div
                  key={fase.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{fase.nombre}</h4>
                    <Badge
                      variant={
                        fase.estado === 'completada'
                          ? 'success'
                          : fase.estado === 'en_progreso'
                          ? 'primary'
                          : 'default'
                      }
                    >
                      {fase.estado}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${fase.avance_porcentaje}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {fase.avance_porcentaje}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay fases definidas
            </p>
          )}
        </Card>
      )}

      {activeTab === 'presupuesto' && (
        <div className="space-y-6">
          {curvaS && curvaS.datos && curvaS.datos.length > 0 && (
            <Card>
              <CardHeader title="Curva S - Ejecución Presupuestaria" />
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curvaS.datos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="planificado_acumulado"
                      stroke="#3b82f6"
                      name="Planificado"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="ejecutado_acumulado"
                      stroke="#22c55e"
                      name="Ejecutado"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50">
              <p className="text-sm text-blue-700">CAPEX Aprobado</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(curvaS?.capex_aprobado || 0)}
              </p>
            </Card>
            <Card className="bg-green-50">
              <p className="text-sm text-green-700">CAPEX Ejecutado</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(curvaS?.total_ejecutado || 0)}
              </p>
            </Card>
            <Card className="bg-yellow-50">
              <p className="text-sm text-yellow-700">Variación</p>
              <p className="text-2xl font-bold text-yellow-900">
                {curvaS?.variacion_costo_porcentaje || 0}%
              </p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'riesgos' && (
        <Card>
          <CardHeader
            title="Riesgos del Proyecto"
            action={
              <Button size="sm" onClick={() => setShowRiesgoModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Riesgo
              </Button>
            }
          />
          {riesgos.length > 0 ? (
            <div className="space-y-4">
              {riesgos.map((riesgo: any) => (
                <div
                  key={riesgo.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{riesgo.descripcion}</p>
                      <div className="flex space-x-4 mt-2 text-sm">
                        <span>
                          Probabilidad:{' '}
                          <strong className="capitalize">
                            {riesgo.probabilidad}
                          </strong>
                        </span>
                        <span>
                          Impacto:{' '}
                          <strong className="capitalize">{riesgo.impacto}</strong>
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={riesgo.estado === 'abierto' ? 'warning' : 'success'}
                    >
                      {riesgo.estado}
                    </Badge>
                  </div>
                  {riesgo.mitigacion && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Mitigación:</strong> {riesgo.mitigacion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay riesgos identificados
            </p>
          )}
        </Card>
      )}

      {activeTab === 'issues' && (
        <Card>
          <CardHeader
            title="Issues del Proyecto"
            action={
              <Button size="sm" onClick={() => setShowIssueModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Reportar Issue
              </Button>
            }
          />
          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((issue: any) => (
                <div
                  key={issue.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{issue.titulo}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {issue.descripcion}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant={
                          issue.severidad === 'critica'
                            ? 'danger'
                            : issue.severidad === 'alta'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {issue.severidad}
                      </Badge>
                      <Badge
                        variant={
                          issue.estado === 'resuelto' ? 'success' : 'default'
                        }
                      >
                        {issue.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay issues reportados</p>
          )}
        </Card>
      )}

      {activeTab === 'bitacora' && (
        <Card>
          <CardHeader
            title="Bitácora del Proyecto"
            action={
              <Button size="sm" onClick={() => setShowBitacoraModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Entrada
              </Button>
            }
          />
          {bitacora.length > 0 ? (
            <div className="space-y-4">
              {bitacora.map((entrada: any) => (
                <div
                  key={entrada.id}
                  className="border-l-4 border-primary-500 pl-4 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(entrada.fecha).toLocaleString()}
                    </span>
                    <Badge>{entrada.tipo}</Badge>
                  </div>
                  <p className="mt-1">{entrada.descripcion}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Por: {entrada.usuario_nombre}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay entradas en la bitácora
            </p>
          )}
        </Card>
      )}

      {/* Modal Agregar Fase */}
      <Modal
        isOpen={showFaseModal}
        onClose={() => setShowFaseModal(false)}
        title="Agregar Nueva Fase"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la Fase"
            value={newFase.nombre}
            onChange={(e) => setNewFase({ ...newFase, nombre: e.target.value })}
            placeholder="Ej: Análisis y Diseño"
            required
          />
          <Input
            label="Descripción"
            value={newFase.descripcion}
            onChange={(e) => setNewFase({ ...newFase, descripcion: e.target.value })}
            placeholder="Descripción de la fase..."
          />
          <Input
            label="Orden"
            type="number"
            value={newFase.orden.toString()}
            onChange={(e) => setNewFase({ ...newFase, orden: parseInt(e.target.value) || 1 })}
            min={1}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowFaseModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateFase}>Crear Fase</Button>
        </div>
      </Modal>

      {/* Modal Agregar Riesgo */}
      <Modal
        isOpen={showRiesgoModal}
        onClose={() => setShowRiesgoModal(false)}
        title="Agregar Nuevo Riesgo"
      >
        <div className="space-y-4">
          <Input
            label="Descripción del Riesgo"
            value={newRiesgo.descripcion}
            onChange={(e) => setNewRiesgo({ ...newRiesgo, descripcion: e.target.value })}
            placeholder="Describa el riesgo identificado..."
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Probabilidad"
              value={newRiesgo.probabilidad}
              onChange={(e) => setNewRiesgo({ ...newRiesgo, probabilidad: e.target.value })}
              options={[
                { value: 'bajo', label: 'Bajo' },
                { value: 'medio', label: 'Medio' },
                { value: 'alto', label: 'Alto' },
                { value: 'critico', label: 'Crítico' },
              ]}
            />
            <Select
              label="Impacto"
              value={newRiesgo.impacto}
              onChange={(e) => setNewRiesgo({ ...newRiesgo, impacto: e.target.value })}
              options={[
                { value: 'bajo', label: 'Bajo' },
                { value: 'medio', label: 'Medio' },
                { value: 'alto', label: 'Alto' },
                { value: 'critico', label: 'Crítico' },
              ]}
            />
          </div>
          <Input
            label="Plan de Mitigación"
            value={newRiesgo.mitigacion}
            onChange={(e) => setNewRiesgo({ ...newRiesgo, mitigacion: e.target.value })}
            placeholder="Describa las acciones de mitigación..."
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowRiesgoModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateRiesgo}>Crear Riesgo</Button>
        </div>
      </Modal>

      {/* Modal Reportar Issue */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="Reportar Nuevo Issue"
      >
        <div className="space-y-4">
          <Input
            label="Título del Issue"
            value={newIssue.titulo}
            onChange={(e) => setNewIssue({ ...newIssue, titulo: e.target.value })}
            placeholder="Ej: Error en integración con sistema X"
            required
          />
          <Input
            label="Descripción"
            value={newIssue.descripcion}
            onChange={(e) => setNewIssue({ ...newIssue, descripcion: e.target.value })}
            placeholder="Describa el issue en detalle..."
            required
          />
          <Select
            label="Severidad"
            value={newIssue.severidad}
            onChange={(e) => setNewIssue({ ...newIssue, severidad: e.target.value })}
            options={[
              { value: 'baja', label: 'Baja' },
              { value: 'media', label: 'Media' },
              { value: 'alta', label: 'Alta' },
              { value: 'critica', label: 'Crítica' },
            ]}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowIssueModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateIssue}>Reportar Issue</Button>
        </div>
      </Modal>

      {/* Modal Agregar Entrada Bitácora */}
      <Modal
        isOpen={showBitacoraModal}
        onClose={() => setShowBitacoraModal(false)}
        title="Agregar Entrada a la Bitácora"
      >
        <div className="space-y-4">
          <Select
            label="Tipo de Entrada"
            value={newBitacora.tipo}
            onChange={(e) => setNewBitacora({ ...newBitacora, tipo: e.target.value })}
            options={[
              { value: 'nota', label: 'Nota' },
              { value: 'decision', label: 'Decisión' },
              { value: 'cambio', label: 'Cambio' },
              { value: 'escalamiento', label: 'Escalamiento' },
            ]}
          />
          <Input
            label="Descripción"
            value={newBitacora.descripcion}
            onChange={(e) => setNewBitacora({ ...newBitacora, descripcion: e.target.value })}
            placeholder="Describa la entrada..."
            required
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowBitacoraModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateBitacora}>Agregar Entrada</Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center">
      <Icon className="h-5 w-5 text-gray-400 mr-3" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
