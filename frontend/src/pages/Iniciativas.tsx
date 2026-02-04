import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciativasService } from '../services/api';
import Card, { CardHeader } from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import { EstadoBadge, PrioridadBadge } from '../components/common/Badge';
import { Select } from '../components/common/Input';
import { Plus, Search, Filter } from 'lucide-react';
import { Iniciativa, EstadoIniciativa, Prioridad } from '../types';

export default function Iniciativas() {
  const navigate = useNavigate();
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    prioridad: '',
    busqueda: '',
  });

  useEffect(() => {
    loadIniciativas();
  }, [filters.estado, filters.prioridad]);

  const loadIniciativas = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filters.estado) params.estado = filters.estado;
      if (filters.prioridad) params.prioridad = filters.prioridad;
      if (filters.busqueda) params.busqueda = filters.busqueda;

      const data = await iniciativasService.getAll(params);
      setIniciativas(data);
    } catch (error) {
      console.error('Error loading iniciativas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadIniciativas();
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
      render: (item: Iniciativa) => (
        <span className="font-medium text-primary-600">{item.codigo}</span>
      ),
    },
    {
      key: 'titulo',
      header: 'Título',
      render: (item: Iniciativa) => (
        <div className="max-w-xs truncate">{item.titulo}</div>
      ),
    },
    {
      key: 'area',
      header: 'Área',
      render: (item: Iniciativa) => item.area_demandante_nombre || '-',
    },
    {
      key: 'monto',
      header: 'Monto Estimado',
      render: (item: Iniciativa) => formatCurrency(item.monto_estimado),
    },
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (item: Iniciativa) =>
        item.prioridad ? <PrioridadBadge prioridad={item.prioridad} /> : '-',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Iniciativa) => <EstadoBadge estado={item.estado} />,
    },
    {
      key: 'fecha',
      header: 'Fecha Solicitud',
      render: (item: Iniciativa) =>
        new Date(item.fecha_solicitud).toLocaleDateString('es-CL'),
    },
  ];

  const estadoOptions = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'enviada', label: 'Enviada' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'en_evaluacion', label: 'En Evaluación' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' },
  ];

  const prioridadOptions = [
    { value: 'P1', label: 'P1 - Muy Alta' },
    { value: 'P2', label: 'P2 - Alta' },
    { value: 'P3', label: 'P3 - Media' },
    { value: 'P4', label: 'P4 - Baja' },
    { value: 'P5', label: 'P5 - Muy Baja' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Iniciativas</h1>
          <p className="text-gray-500 mt-1">
            Gestión de requerimientos digitales
          </p>
        </div>
        <Link to="/iniciativas/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Iniciativa
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título o descripción..."
                value={filters.busqueda}
                onChange={(e) =>
                  setFilters({ ...filters, busqueda: e.target.value })
                }
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
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
              options={prioridadOptions}
              value={filters.prioridad}
              onChange={(e) =>
                setFilters({ ...filters, prioridad: e.target.value })
              }
              placeholder="Prioridad"
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </Card>

      {/* Tabla */}
      <Card padding="none">
        <Table
          columns={columns}
          data={iniciativas}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => navigate(`/iniciativas/${item.id}`)}
          isLoading={isLoading}
          emptyMessage="No se encontraron iniciativas"
        />
      </Card>
    </div>
  );
}
