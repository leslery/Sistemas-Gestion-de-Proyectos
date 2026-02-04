import { useEffect, useState } from 'react';
import { proyectosService } from '../services/api';
import Card, { CardHeader } from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import { SemaforoBadge } from '../components/common/Badge';
import Badge from '../components/common/Badge';
import { Select } from '../components/common/Input';
import { FolderKanban, Filter } from 'lucide-react';
import { Proyecto, EstadoProyecto, SemaforoSalud } from '../types';
import { useProjectDetail } from '../contexts/ProjectDetailContext';

export default function Proyectos() {
  const { openProjectDetail } = useProjectDetail();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    semaforo: '',
  });

  useEffect(() => {
    loadProyectos();
  }, [filters]);

  // Datos mock para modo demo
  const getMockProyectos = (): Proyecto[] => [
    {
      id: 1,
      codigo_proyecto: 'PRY-2026-001',
      nombre: 'Modernización ERP SAP S/4HANA',
      descripcion: 'Migración del sistema ERP a SAP S/4HANA Cloud',
      area_demandante_nombre: 'Tecnología de la Información',
      presupuesto_asignado: 850000000,
      avance_porcentaje: 65,
      semaforo_salud: 'verde' as SemaforoSalud,
      estado: 'en_ejecucion' as EstadoProyecto,
      riesgos_abiertos: 2,
      issues_abiertos: 1,
    },
    {
      id: 2,
      codigo_proyecto: 'PRY-2026-002',
      nombre: 'Portal de Autoatención Clientes',
      descripcion: 'Desarrollo de portal web para autogestión de clientes',
      area_demandante_nombre: 'Comercial',
      presupuesto_asignado: 320000000,
      avance_porcentaje: 40,
      semaforo_salud: 'amarillo' as SemaforoSalud,
      estado: 'en_ejecucion' as EstadoProyecto,
      riesgos_abiertos: 3,
      issues_abiertos: 2,
    },
    {
      id: 3,
      codigo_proyecto: 'PRY-2026-003',
      nombre: 'Sistema CRM Salesforce',
      descripcion: 'Implementación de CRM para gestión comercial',
      area_demandante_nombre: 'Comercial',
      presupuesto_asignado: 450000000,
      avance_porcentaje: 85,
      semaforo_salud: 'verde' as SemaforoSalud,
      estado: 'en_ejecucion' as EstadoProyecto,
      riesgos_abiertos: 1,
      issues_abiertos: 0,
    },
    {
      id: 4,
      codigo_proyecto: 'PRY-2026-004',
      nombre: 'Migración Cloud AWS',
      descripcion: 'Migración de infraestructura on-premise a AWS',
      area_demandante_nombre: 'Tecnología de la Información',
      presupuesto_asignado: 280000000,
      avance_porcentaje: 25,
      semaforo_salud: 'rojo' as SemaforoSalud,
      estado: 'en_ejecucion' as EstadoProyecto,
      riesgos_abiertos: 4,
      issues_abiertos: 3,
    },
    {
      id: 5,
      codigo_proyecto: 'PRY-2025-089',
      nombre: 'Sistema de Business Intelligence',
      descripcion: 'Plataforma de análisis y reportería corporativa',
      area_demandante_nombre: 'Finanzas',
      presupuesto_asignado: 180000000,
      avance_porcentaje: 100,
      semaforo_salud: 'verde' as SemaforoSalud,
      estado: 'completado' as EstadoProyecto,
      riesgos_abiertos: 0,
      issues_abiertos: 0,
    },
    {
      id: 6,
      codigo_proyecto: 'PRY-2026-005',
      nombre: 'App Móvil Corporativa',
      descripcion: 'Aplicación móvil para colaboradores',
      area_demandante_nombre: 'Recursos Humanos',
      presupuesto_asignado: 95000000,
      avance_porcentaje: 0,
      semaforo_salud: 'verde' as SemaforoSalud,
      estado: 'banco_reserva' as EstadoProyecto,
      riesgos_abiertos: 0,
      issues_abiertos: 0,
    },
  ];

  const loadProyectos = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filters.estado) params.estado = filters.estado;
      if (filters.semaforo) params.semaforo = filters.semaforo;

      const data = await proyectosService.getAll(params);

      // Si la API devuelve datos vacíos, usar mock data
      if (!data || data.length === 0) {
        let mockData = getMockProyectos();
        if (filters.estado) {
          mockData = mockData.filter(p => p.estado === filters.estado);
        }
        if (filters.semaforo) {
          mockData = mockData.filter(p => p.semaforo_salud === filters.semaforo);
        }
        setProyectos(mockData);
      } else {
        setProyectos(data);
      }
    } catch (error) {
      console.error('Error loading proyectos:', error);
      // Usar datos mock cuando la API no está disponible
      let mockData = getMockProyectos();
      if (filters.estado) {
        mockData = mockData.filter(p => p.estado === filters.estado);
      }
      if (filters.semaforo) {
        mockData = mockData.filter(p => p.semaforo_salud === filters.semaforo);
      }
      setProyectos(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);

  const estadoLabels: Record<string, string> = {
    banco_reserva: 'Banco Reserva',
    plan_anual: 'Plan Anual',
    en_ejecucion: 'En Ejecución',
    pausado: 'Pausado',
    cancelado: 'Cancelado',
    completado: 'Completado',
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      render: (item: Proyecto) => (
        <span className="font-medium text-primary-600">{item.codigo_proyecto}</span>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (item: Proyecto) => (
        <div className="max-w-xs truncate">{item.nombre}</div>
      ),
    },
    {
      key: 'area',
      header: 'Área',
      render: (item: Proyecto) => item.area_demandante_nombre || '-',
    },
    {
      key: 'presupuesto',
      header: 'Presupuesto',
      render: (item: Proyecto) => formatCurrency(item.presupuesto_asignado),
    },
    {
      key: 'avance',
      header: 'Avance',
      render: (item: Proyecto) => (
        <div className="flex items-center">
          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${item.avance_porcentaje}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{item.avance_porcentaje}%</span>
        </div>
      ),
    },
    {
      key: 'semaforo',
      header: 'Salud',
      render: (item: Proyecto) => <SemaforoBadge semaforo={item.semaforo_salud} />,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Proyecto) => (
        <Badge
          variant={
            item.estado === 'en_ejecucion'
              ? 'success'
              : item.estado === 'completado'
              ? 'primary'
              : 'default'
          }
        >
          {estadoLabels[item.estado] || item.estado}
        </Badge>
      ),
    },
    {
      key: 'alertas',
      header: 'Alertas',
      render: (item: Proyecto) => (
        <div className="text-sm text-gray-500">
          {(item.riesgos_abiertos || 0) > 0 && (
            <span className="text-yellow-600 mr-2">
              {item.riesgos_abiertos} riesgos
            </span>
          )}
          {(item.issues_abiertos || 0) > 0 && (
            <span className="text-red-600">{item.issues_abiertos} issues</span>
          )}
        </div>
      ),
    },
  ];

  const estadoOptions = [
    { value: 'banco_reserva', label: 'Banco Reserva' },
    { value: 'plan_anual', label: 'Plan Anual' },
    { value: 'en_ejecucion', label: 'En Ejecución' },
    { value: 'completado', label: 'Completado' },
  ];

  const semaforoOptions = [
    { value: 'verde', label: 'Verde - En Control' },
    { value: 'amarillo', label: 'Amarillo - En Riesgo' },
    { value: 'rojo', label: 'Rojo - Crítico' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500 mt-1">
            Gestión y seguimiento de proyectos digitales
          </p>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Proyectos"
          value={proyectos.length}
          color="blue"
        />
        <StatCard
          label="En Ejecución"
          value={proyectos.filter((p) => p.estado === 'en_ejecucion').length}
          color="green"
        />
        <StatCard
          label="En Riesgo"
          value={
            proyectos.filter(
              (p) =>
                p.semaforo_salud === 'amarillo' || p.semaforo_salud === 'rojo'
            ).length
          }
          color="yellow"
        />
        <StatCard
          label="Completados"
          value={proyectos.filter((p) => p.estado === 'completado').length}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="w-48">
            <Select
              options={estadoOptions}
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            />
          </div>
          <div className="w-48">
            <Select
              options={semaforoOptions}
              value={filters.semaforo}
              onChange={(e) => setFilters({ ...filters, semaforo: e.target.value })}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setFilters({ estado: '', semaforo: '' })}
          >
            Limpiar Filtros
          </Button>
        </div>
      </Card>

      {/* Tabla */}
      <Card padding="none">
        <Table
          columns={columns}
          data={proyectos}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => openProjectDetail({ id: item.id.toString(), title: item.nombre, ...item })}
          isLoading={isLoading}
          emptyMessage="No se encontraron proyectos"
        />
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card className={colors[color]}>
      <p className="text-sm opacity-75">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
}
