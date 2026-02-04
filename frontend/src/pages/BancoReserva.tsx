import { useEffect, useState } from 'react';
import { proyectosService, dashboardService } from '../services/api';
import Card, { CardHeader } from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import { PrioridadBadge } from '../components/common/Badge';
import { Archive, TrendingUp, DollarSign } from 'lucide-react';
import { useProjectDetail } from '../contexts/ProjectDetailContext';

export default function BancoReserva() {
  const { openProjectDetail } = useProjectDetail();
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [proyectosData, statsData] = await Promise.all([
        proyectosService.getBancoReserva(),
        dashboardService.getPorRol().then((d) => d.banco_reserva || null).catch(() => null),
      ]);
      setProyectos(proyectosData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      render: (item: any) => (
        <span className="font-medium text-primary-600">{item.codigo_proyecto}</span>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (item: any) => (
        <div className="max-w-xs truncate">{item.nombre}</div>
      ),
    },
    {
      key: 'area',
      header: 'Área',
      render: (item: any) => item.area_demandante_nombre || '-',
    },
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (item: any) => {
        const prioridad = item.iniciativa?.prioridad;
        return prioridad ? <PrioridadBadge prioridad={prioridad} /> : '-';
      },
    },
    {
      key: 'presupuesto',
      header: 'Presupuesto',
      render: (item: any) => formatCurrency(item.presupuesto_asignado),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: any) => (
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openProjectDetail({ id: item.id.toString(), title: item.nombre, ...item }); }}>
          Ver Detalle
        </Button>
      ),
    },
  ];

  // Agrupar por prioridad
  const proyectosPorPrioridad = proyectos.reduce((acc: any, p) => {
    const prioridad = p.iniciativa?.prioridad || 'Sin prioridad';
    if (!acc[prioridad]) acc[prioridad] = [];
    acc[prioridad].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banco de Reserva Estratégico</h1>
        <p className="text-gray-500 mt-1">
          Proyectos aprobados en espera de asignación al Plan Anual
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Archive className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total Proyectos</p>
            <p className="text-2xl font-bold text-gray-900">{proyectos.length}</p>
          </div>
        </Card>
        <Card className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Monto Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                proyectos.reduce((sum, p) => sum + (p.presupuesto_asignado || 0), 0)
              )}
            </p>
          </div>
        </Card>
        <Card className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Alta Prioridad (P1-P2)</p>
            <p className="text-2xl font-bold text-gray-900">
              {proyectos.filter(
                (p) =>
                  p.iniciativa?.prioridad === 'P1' || p.iniciativa?.prioridad === 'P2'
              ).length}
            </p>
          </div>
        </Card>
      </div>

      {/* Distribución por Prioridad */}
      <Card>
        <CardHeader title="Distribución por Prioridad" />
        <div className="grid grid-cols-5 gap-4">
          {['P1', 'P2', 'P3', 'P4', 'P5'].map((p) => (
            <div
              key={p}
              className={`p-4 rounded-lg text-center ${
                p === 'P1'
                  ? 'bg-red-50'
                  : p === 'P2'
                  ? 'bg-orange-50'
                  : p === 'P3'
                  ? 'bg-yellow-50'
                  : p === 'P4'
                  ? 'bg-blue-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold">
                {proyectosPorPrioridad[p]?.length || 0}
              </div>
              <div className="text-sm text-gray-600">{p}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabla */}
      <Card padding="none">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Proyectos en Banco de Reserva</h3>
        </div>
        <Table
          columns={columns}
          data={proyectos}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => openProjectDetail({ id: item.id.toString(), title: item.nombre, ...item })}
          isLoading={isLoading}
          emptyMessage="No hay proyectos en el banco de reserva"
        />
      </Card>
    </div>
  );
}
