import { useState } from 'react';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  CheckCircle,
  Link2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';

interface ObjetivoEstrategico {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  area: string;
  iniciativasVinculadas: number;
  cumplimiento: number;
  estado: 'activo' | 'completado' | 'pausado';
}

const objetivos: ObjetivoEstrategico[] = [
  { id: 1, codigo: 'OE-001', nombre: 'Transformación Digital', descripcion: 'Impulsar la digitalización de procesos core del negocio', area: 'TI', iniciativasVinculadas: 8, cumplimiento: 65, estado: 'activo' },
  { id: 2, codigo: 'OE-002', nombre: 'Eficiencia Operacional', descripcion: 'Reducir costos operativos en un 15% mediante automatización', area: 'Operaciones', iniciativasVinculadas: 5, cumplimiento: 45, estado: 'activo' },
  { id: 3, codigo: 'OE-003', nombre: 'Experiencia del Cliente', descripcion: 'Mejorar NPS en 20 puntos mediante canales digitales', area: 'Comercial', iniciativasVinculadas: 4, cumplimiento: 80, estado: 'activo' },
  { id: 4, codigo: 'OE-004', nombre: 'Sustentabilidad', descripcion: 'Reducir huella de carbono en operaciones', area: 'RRHH', iniciativasVinculadas: 2, cumplimiento: 30, estado: 'activo' },
];

export default function PlanificacionEstrategica() {
  const [selectedObjetivo, setSelectedObjetivo] = useState<ObjetivoEstrategico | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-7 w-7 text-accent" />
            Planificación Estratégica
          </h1>
          <p className="text-gray-500 mt-1">Objetivos estratégicos y alineación de iniciativas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Objetivo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Objetivos Activos"
          value={objetivos.filter((o) => o.estado === 'activo').length}
          icon={Target}
          color="primary"
        />
        <KPICard
          title="Iniciativas Alineadas"
          value={objetivos.reduce((acc, o) => acc + o.iniciativasVinculadas, 0)}
          icon={Link2}
          color="success"
        />
        <KPICard
          title="Cumplimiento Promedio"
          value={`${Math.round(objetivos.reduce((acc, o) => acc + o.cumplimiento, 0) / objetivos.length)}%`}
          icon={TrendingUp}
          color="primary"
        />
        <KPICard
          title="Áreas Involucradas"
          value={new Set(objetivos.map((o) => o.area)).size}
          icon={Users}
          color="default"
        />
      </div>

      {/* Objetivos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {objetivos.map((objetivo) => (
          <div
            key={objetivo.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedObjetivo(objetivo)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
                  {objetivo.codigo.split('-')[1]}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{objetivo.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{objetivo.descripcion}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      {objetivo.area}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded">
                      {objetivo.iniciativasVinculadas} iniciativas
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Cumplimiento</span>
                <span className="text-xs font-medium text-gray-700">{objetivo.cumplimiento}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    objetivo.cumplimiento >= 70 ? 'bg-green-500' :
                    objetivo.cumplimiento >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${objetivo.cumplimiento}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Matriz de Alineación */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Matriz de Alineación Estratégica</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                  Objetivo
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">
                  Iniciativas
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">
                  Proyectos
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">
                  Inversión
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">
                  Cumplimiento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {objetivos.map((obj) => (
                <tr key={obj.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-accent">{obj.codigo}</span>
                      <span className="text-sm text-gray-900">{obj.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {obj.iniciativasVinculadas}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {Math.floor(obj.iniciativasVinculadas * 0.6)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    ${(obj.iniciativasVinculadas * 250).toLocaleString()}M
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            obj.cumplimiento >= 70 ? 'bg-green-500' :
                            obj.cumplimiento >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${obj.cumplimiento}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{obj.cumplimiento}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
