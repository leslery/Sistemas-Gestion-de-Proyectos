import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { proyectosService } from '../services/api';
import Card, { CardHeader } from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import { SemaforoBadge } from '../components/common/Badge';
import Badge from '../components/common/Badge';
import { Select } from '../components/common/Input';
import { FolderKanban, Filter } from 'lucide-react';
import { Proyecto, EstadoProyecto, SemaforoSalud } from '../types';

export default function Proyectos() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    semaforo: '',
  });

  useEffect(() => {
    loadProyectos();
  }, [filters]);

  const loadProyectos = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filters.estado) params.estado = filters.estado;
      if (filters.semaforo) params.semaforo = filters.semaforo;

      const data = await proyectosService.getAll(params);
      setProyectos(data);
    } catch (error) {
      console.error('Error loading proyectos:', error);
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
              placeholder="Estado"
            />
          </div>
          <div className="w-48">
            <Select
              options={semaforoOptions}
              value={filters.semaforo}
              onChange={(e) => setFilters({ ...filters, semaforo: e.target.value })}
              placeholder="Semáforo"
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
          onRowClick={(item) => navigate(`/proyectos/${item.id}`)}
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
