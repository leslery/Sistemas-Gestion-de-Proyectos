import { useState } from 'react';
import {
  Users,
  Shield,
  Grid3X3,
  Plus,
  Search,
  Edit,
  Trash2,
  Key,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  User,
} from 'lucide-react';

// Types
interface Usuario {
  id: number;
  usuario: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  rolId: number;
  area: string;
  ultimoAcceso: string;
  estado: 'activo' | 'inactivo';
}

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  usuarios: number;
  permisos: number;
  predefinido: boolean;
}

interface Permiso {
  id: string;
  nombre: string;
  modulo: string;
}

interface PermisoRol {
  [rolId: number]: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
}

// Mock Data
const usuariosMock: Usuario[] = [
  { id: 1, usuario: 'ltolorzar', nombreCompleto: 'Luis Tolorzar', email: 'ltolorzar@cge.cl', rol: 'Administrador', rolId: 1, area: 'PMO', ultimoAcceso: '2026-02-02 10:30', estado: 'activo' },
  { id: 2, usuario: 'cmendez', nombreCompleto: 'Carlos Méndez', email: 'cmendez@cge.cl', rol: 'Project Manager', rolId: 3, area: 'TI', ultimoAcceso: '2026-02-02 09:15', estado: 'activo' },
  { id: 3, usuario: 'agarcia', nombreCompleto: 'Ana García', email: 'agarcia@cge.cl', rol: 'Project Manager', rolId: 3, area: 'Comercial', ultimoAcceso: '2026-02-01 18:45', estado: 'activo' },
  { id: 4, usuario: 'rsilva', nombreCompleto: 'Roberto Silva', email: 'rsilva@cge.cl', rol: 'Analista', rolId: 4, area: 'Seguridad', ultimoAcceso: '2026-02-02 08:00', estado: 'activo' },
  { id: 5, usuario: 'mlopez', nombreCompleto: 'María López', email: 'mlopez@cge.cl', rol: 'PMO Manager', rolId: 2, area: 'Digital', ultimoAcceso: '2026-01-31 14:30', estado: 'activo' },
  { id: 6, usuario: 'projas', nombreCompleto: 'Pedro Rojas', email: 'projas@cge.cl', rol: 'Usuario Estándar', rolId: 5, area: 'Infraestructura', ultimoAcceso: '2026-02-01 11:20', estado: 'activo' },
  { id: 7, usuario: 'viewer1', nombreCompleto: 'Juan Pérez', email: 'jperez@cge.cl', rol: 'Visualizador', rolId: 6, area: 'Finanzas', ultimoAcceso: '2026-01-30 09:00', estado: 'activo' },
  { id: 8, usuario: 'ltorres', nombreCompleto: 'Luis Torres', email: 'ltorres@cge.cl', rol: 'Project Manager', rolId: 3, area: 'Operaciones', ultimoAcceso: '2026-01-15 10:00', estado: 'inactivo' },
];

const rolesMock: Rol[] = [
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo al sistema. Puede gestionar usuarios, roles y todas las configuraciones.', color: '#e53e3e', icono: 'shield', usuarios: 1, permisos: 40, predefinido: true },
  { id: 2, nombre: 'PMO Manager', descripcion: 'Gestión del portafolio de proyectos. Acceso a dashboards ejecutivos y aprobaciones.', color: '#3182ce', icono: 'briefcase', usuarios: 1, permisos: 40, predefinido: true },
  { id: 3, nombre: 'Project Manager', descripcion: 'Gestión de proyectos asignados, seguimiento, control y reportes de sus proyectos.', color: '#38a169', icono: 'folder', usuarios: 3, permisos: 35, predefinido: true },
  { id: 4, nombre: 'Analista', descripcion: 'Análisis de datos y generación de reportes. Acceso de lectura a métricas y KPIs.', color: '#00b5d8', icono: 'chart', usuarios: 1, permisos: 35, predefinido: true },
  { id: 5, nombre: 'Usuario Estándar', descripcion: 'Acceso básico para ingresar requerimientos y consultar estado de iniciativas.', color: '#805ad5', icono: 'user', usuarios: 1, permisos: 31, predefinido: true },
  { id: 6, nombre: 'Visualizador', descripcion: 'Solo lectura. Puede ver dashboards y reportes sin capacidad de edición.', color: '#718096', icono: 'eye', usuarios: 1, permisos: 7, predefinido: true },
];

const modulosPermisos = [
  {
    modulo: 'Dashboard',
    permisos: [
      { id: 'dash_view', nombre: 'Vista Ejecutiva' },
      { id: 'dash_portfolio', nombre: 'Portafolio' },
      { id: 'dash_finance', nombre: 'Vista Financiera' },
    ],
  },
  {
    modulo: 'Activación',
    permisos: [
      { id: 'act_plan', nombre: 'Planificación Estratégica' },
      { id: 'act_req', nombre: 'Ingreso de Requerimientos' },
      { id: 'act_fact', nombre: 'Informes de Factibilidad' },
      { id: 'act_comite', nombre: 'Comité de Expertos' },
      { id: 'act_banco', nombre: 'Banco de Reserva' },
      { id: 'act_indiv', nombre: 'Activación Individual' },
      { id: 'act_extra', nombre: 'Ingreso Extraordinario' },
    ],
  },
  {
    modulo: 'Implementación',
    permisos: [
      { id: 'impl_kickoff', nombre: 'Planificación / Kick Off' },
      { id: 'impl_analisis', nombre: 'Análisis y Diseño' },
      { id: 'impl_construccion', nombre: 'Construcción' },
      { id: 'impl_pruebas', nombre: 'Pruebas' },
      { id: 'impl_transicion', nombre: 'Transición' },
      { id: 'impl_golive', nombre: 'Go Live' },
    ],
  },
  {
    modulo: 'Seguimiento',
    permisos: [
      { id: 'seg_presupuesto', nombre: 'Control Presupuestario' },
      { id: 'seg_planificacion', nombre: 'Control Planificación' },
      { id: 'seg_riesgos', nombre: 'Gestión de Riesgos' },
      { id: 'seg_gobernanza', nombre: 'Control Gobernanza' },
      { id: 'seg_documentos', nombre: 'Gestión Documental' },
      { id: 'seg_metricas', nombre: 'Evaluación y Métricas' },
    ],
  },
  {
    modulo: 'Configuración',
    permisos: [
      { id: 'conf_catalogos', nombre: 'Catálogos Maestros' },
      { id: 'conf_usuarios', nombre: 'Usuarios y Permisos' },
      { id: 'conf_flujos', nombre: 'Flujos de Trabajo' },
      { id: 'conf_plantillas', nombre: 'Plantillas' },
      { id: 'conf_integraciones', nombre: 'Integraciones' },
    ],
  },
];

// Generate mock permissions matrix
const generarPermisosRol = (rolId: number): { [permisoId: string]: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } } => {
  const permisos: { [key: string]: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } } = {};

  modulosPermisos.forEach(modulo => {
    modulo.permisos.forEach(permiso => {
      if (rolId === 1) { // Admin - todo
        permisos[permiso.id] = { ver: true, crear: true, editar: true, eliminar: true };
      } else if (rolId === 2) { // PMO Manager
        permisos[permiso.id] = { ver: true, crear: true, editar: true, eliminar: permiso.id.startsWith('conf_') ? false : true };
      } else if (rolId === 3) { // Project Manager
        permisos[permiso.id] = { ver: true, crear: !permiso.id.startsWith('conf_'), editar: !permiso.id.startsWith('conf_'), eliminar: false };
      } else if (rolId === 4) { // Analista
        permisos[permiso.id] = { ver: true, crear: permiso.id.startsWith('seg_'), editar: permiso.id.startsWith('seg_'), eliminar: false };
      } else if (rolId === 5) { // Usuario Estándar
        permisos[permiso.id] = { ver: true, crear: permiso.id === 'act_req', editar: permiso.id === 'act_req', eliminar: false };
      } else { // Visualizador
        permisos[permiso.id] = { ver: true, crear: false, editar: false, eliminar: false };
      }
    });
  });

  return permisos;
};

export default function UsuariosPermisos() {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles' | 'matriz'>('usuarios');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRol, setFilterRol] = useState('all');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewRolModal, setShowNewRolModal] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [newRol, setNewRol] = useState({
    nombre: '',
    descripcion: '',
    color: '#3182ce',
    permisos: {} as { [key: string]: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } },
  });

  const filteredUsuarios = usuariosMock.filter((u) => {
    if (searchQuery && !u.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !u.usuario.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterRol !== 'all' && u.rolId.toString() !== filterRol) return false;
    return true;
  });

  const tabs = [
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'matriz', label: 'Matriz de Permisos', icon: Grid3X3 },
  ];

  const handleCreateRol = () => {
    // Initialize permissions for new role
    const initialPermisos: { [key: string]: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } } = {};
    modulosPermisos.forEach(modulo => {
      modulo.permisos.forEach(permiso => {
        initialPermisos[permiso.id] = { ver: false, crear: false, editar: false, eliminar: false };
      });
    });
    setNewRol({
      nombre: '',
      descripcion: '',
      color: '#3182ce',
      permisos: initialPermisos,
    });
    setShowNewRolModal(true);
  };

  const handleEditRol = (rol: Rol) => {
    setEditingRol(rol);
    setNewRol({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      color: rol.color,
      permisos: generarPermisosRol(rol.id),
    });
    setShowNewRolModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-accent" />
            Usuarios y Permisos
          </h1>
          <p className="text-gray-500 mt-1">Gestión de accesos, roles y permisos del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* USUARIOS TAB */}
          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar usuarios..."
                      className="w-64 py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <select
                    value={filterRol}
                    onChange={(e) => setFilterRol(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="all">Todos los roles</option>
                    {rolesMock.map((rol) => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowNewUserModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Usuario
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Acceso</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsuarios.map((usuario) => {
                      const rol = rolesMock.find(r => r.id === usuario.rolId);
                      return (
                        <tr key={usuario.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">{usuario.usuario}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">{usuario.nombreCompleto}</span>
                          </td>
                          <td className="px-4 py-3">
                            <a href={`mailto:${usuario.email}`} className="text-sm text-accent hover:underline">
                              {usuario.email}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: `${rol?.color}20`, color: rol?.color }}
                            >
                              <Shield className="h-3 w-3" />
                              {usuario.rol}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">{usuario.area}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-500">{usuario.ultimoAcceso}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              usuario.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {usuario.estado === 'activo' ? (
                                <><CheckCircle className="h-3 w-3" /> Activo</>
                              ) : (
                                <><XCircle className="h-3 w-3" /> Inactivo</>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Editar">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Cambiar Contraseña">
                                <Key className="h-4 w-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROLES TAB */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Shield className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Los roles definen el conjunto de permisos que tendrán los usuarios. Puede crear roles personalizados o usar los predefinidos.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={handleCreateRol}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Rol
                </button>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rolesMock.map((rol) => (
                  <div
                    key={rol.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${rol.color}20` }}
                        >
                          <Shield className="h-6 w-6" style={{ color: rol.color }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{rol.nombre}</h3>
                          {rol.predefinido && (
                            <span className="text-xs text-gray-500">Predefinido</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">{rol.descripcion}</p>

                    <div className="flex items-center gap-6 mt-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{rol.usuarios}</p>
                        <p className="text-xs text-gray-500">Usuarios</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{rol.permisos}</p>
                        <p className="text-xs text-gray-500">Permisos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      {rol.predefinido && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          Predefinido
                        </span>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={() => handleEditRol(rol)}
                        className="text-sm text-accent hover:underline flex items-center gap-1"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Permisos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MATRIZ DE PERMISOS TAB */}
          {activeTab === 'matriz' && (
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <Grid3X3 className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Matriz de permisos por rol. Los cambios se guardan automáticamente.
                </p>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase sticky left-0 bg-gray-900 z-10">
                        Módulo / Funcionalidad
                      </th>
                      {rolesMock.map((rol) => (
                        <th key={rol.id} className="px-3 py-3 text-center text-xs font-medium uppercase min-w-[100px]">
                          {rol.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modulosPermisos.map((modulo, mIndex) => (
                      <>
                        {/* Module Header */}
                        <tr key={modulo.modulo} className="bg-gray-100">
                          <td
                            colSpan={rolesMock.length + 1}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100"
                          >
                            {modulo.modulo}
                          </td>
                        </tr>
                        {/* Permissions */}
                        {modulo.permisos.map((permiso, pIndex) => {
                          return (
                            <tr key={permiso.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-700 sticky left-0 bg-white">
                                <div className="flex items-center gap-2 pl-4">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                  {permiso.nombre}
                                </div>
                              </td>
                              {rolesMock.map((rol) => {
                                const permisos = generarPermisosRol(rol.id);
                                const p = permisos[permiso.id] || { ver: false, crear: false, editar: false, eliminar: false };
                                return (
                                  <td key={rol.id} className="px-2 py-2 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {p.ver && (
                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                                          Ver
                                        </span>
                                      )}
                                      {p.crear && (
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                                          Crear
                                        </span>
                                      )}
                                      {p.editar && (
                                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
                                          Editar
                                        </span>
                                      )}
                                      {p.eliminar && (
                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                                          Eliminar
                                        </span>
                                      )}
                                      {!p.ver && !p.crear && !p.editar && !p.eliminar && (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo/Editar Rol */}
      {showNewRolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRol ? `Editar Rol: ${editingRol.nombre}` : 'Crear Nuevo Rol'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Configure el nombre, descripción y permisos del rol
              </p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
                    <input
                      type="text"
                      value={newRol.nombre}
                      onChange={(e) => setNewRol({ ...newRol, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                      placeholder="Ej: Supervisor de Proyectos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newRol.color}
                        onChange={(e) => setNewRol({ ...newRol, color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newRol.color}
                        onChange={(e) => setNewRol({ ...newRol, color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={newRol.descripcion}
                    onChange={(e) => setNewRol({ ...newRol, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                    rows={2}
                    placeholder="Descripción del rol y sus responsabilidades"
                  />
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Configurar Permisos</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Funcionalidad</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">Ver</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">Crear</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">Editar</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">Eliminar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modulosPermisos.map((modulo) => (
                          <>
                            <tr key={modulo.modulo} className="bg-gray-100">
                              <td colSpan={5} className="px-4 py-2 text-sm font-semibold text-gray-700">
                                {modulo.modulo}
                              </td>
                            </tr>
                            {modulo.permisos.map((permiso) => {
                              const p = newRol.permisos[permiso.id] || { ver: false, crear: false, editar: false, eliminar: false };
                              return (
                                <tr key={permiso.id} className="border-b border-gray-100">
                                  <td className="px-4 py-2 text-sm text-gray-700 pl-8">{permiso.nombre}</td>
                                  <td className="px-4 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={p.ver}
                                      onChange={(e) => setNewRol({
                                        ...newRol,
                                        permisos: {
                                          ...newRol.permisos,
                                          [permiso.id]: { ...p, ver: e.target.checked }
                                        }
                                      })}
                                      className="rounded text-accent focus:ring-accent"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={p.crear}
                                      onChange={(e) => setNewRol({
                                        ...newRol,
                                        permisos: {
                                          ...newRol.permisos,
                                          [permiso.id]: { ...p, crear: e.target.checked }
                                        }
                                      })}
                                      className="rounded text-accent focus:ring-accent"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={p.editar}
                                      onChange={(e) => setNewRol({
                                        ...newRol,
                                        permisos: {
                                          ...newRol.permisos,
                                          [permiso.id]: { ...p, editar: e.target.checked }
                                        }
                                      })}
                                      className="rounded text-accent focus:ring-accent"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={p.eliminar}
                                      onChange={(e) => setNewRol({
                                        ...newRol,
                                        permisos: {
                                          ...newRol.permisos,
                                          [permiso.id]: { ...p, eliminar: e.target.checked }
                                        }
                                      })}
                                      className="rounded text-accent focus:ring-accent"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewRolModal(false);
                  setEditingRol(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowNewRolModal(false);
                  setEditingRol(null);
                }}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                {editingRol ? 'Guardar Cambios' : 'Crear Rol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Usuario */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Usuario</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="nombre.apellido"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="usuario@cge.cl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent">
                  {rolesMock.map((rol) => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent">
                  <option value="PMO">PMO</option>
                  <option value="TI">TI</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Operaciones">Operaciones</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewUserModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
