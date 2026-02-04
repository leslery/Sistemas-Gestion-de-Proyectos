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
  Power,
  AlertTriangle,
  ArrowRight,
  UserMinus,
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
  activo: boolean;
  permisosConfig?: { [permisoId: string]: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } };
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
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo al sistema. Puede gestionar usuarios, roles y todas las configuraciones.', color: '#e53e3e', icono: 'shield', usuarios: 1, permisos: 40, predefinido: true, activo: true },
  { id: 2, nombre: 'PMO Manager', descripcion: 'Gestión del portafolio de proyectos. Acceso a dashboards ejecutivos y aprobaciones.', color: '#3182ce', icono: 'briefcase', usuarios: 1, permisos: 40, predefinido: true, activo: true },
  { id: 3, nombre: 'Project Manager', descripcion: 'Gestión de proyectos asignados, seguimiento, control y reportes de sus proyectos.', color: '#38a169', icono: 'folder', usuarios: 3, permisos: 35, predefinido: true, activo: true },
  { id: 4, nombre: 'Analista', descripcion: 'Análisis de datos y generación de reportes. Acceso de lectura a métricas y KPIs.', color: '#00b5d8', icono: 'chart', usuarios: 1, permisos: 35, predefinido: true, activo: true },
  { id: 5, nombre: 'Usuario Estándar', descripcion: 'Acceso básico para ingresar requerimientos y consultar estado de iniciativas.', color: '#805ad5', icono: 'user', usuarios: 1, permisos: 31, predefinido: true, activo: true },
  { id: 6, nombre: 'Visualizador', descripcion: 'Solo lectura. Puede ver dashboards y reportes sin capacidad de edición.', color: '#718096', icono: 'eye', usuarios: 1, permisos: 7, predefinido: true, activo: true },
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
  const [roles, setRoles] = useState<Rol[]>(rolesMock);
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosMock);
  const [deleteConfirmRol, setDeleteConfirmRol] = useState<Rol | null>(null);
  const [newRol, setNewRol] = useState({
    nombre: '',
    descripcion: '',
    color: '#3182ce',
    permisos: {} as { [key: string]: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } },
  });
  const [reassignToRolId, setReassignToRolId] = useState<number | null>(null);
  const [showReassignSection, setShowReassignSection] = useState(false);

  const filteredUsuarios = usuarios.filter((u) => {
    if (searchQuery && !u.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !u.usuario.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterRol !== 'all' && u.rolId.toString() !== filterRol) return false;
    return true;
  });

  // Get users assigned to a specific role
  const getUsuariosByRol = (rolId: number) => usuarios.filter(u => u.rolId === rolId);

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
      permisos: rol.permisosConfig || generarPermisosRol(rol.id),
    });
    setReassignToRolId(null);
    setShowReassignSection(false);
    setShowNewRolModal(true);
  };

  const handleToggleRolActivo = (rolId: number) => {
    setRoles(roles.map(r =>
      r.id === rolId ? { ...r, activo: !r.activo } : r
    ));
  };

  const handleDeleteRol = (rol: Rol) => {
    setDeleteConfirmRol(rol);
  };

  const confirmDeleteRol = () => {
    if (deleteConfirmRol) {
      setRoles(roles.filter(r => r.id !== deleteConfirmRol.id));
      setDeleteConfirmRol(null);
    }
  };

  // Get active roles for the matrix
  const rolesActivos = roles.filter(r => r.activo);

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
                    {roles.map((rol) => (
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
                      const rol = roles.find(r => r.id === usuario.rolId);
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
                {roles.map((rol) => (
                  <div
                    key={rol.id}
                    className={`bg-white rounded-xl border p-5 transition-colors ${
                      rol.activo
                        ? 'border-gray-200 hover:border-accent/50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${!rol.activo ? 'grayscale' : ''}`}
                          style={{ backgroundColor: `${rol.color}20` }}
                        >
                          <Shield className="h-6 w-6" style={{ color: rol.color }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{rol.nombre}</h3>
                          <div className="flex items-center gap-2">
                            {rol.predefinido && (
                              <span className="text-xs text-gray-500">Predefinido</span>
                            )}
                            {!rol.activo && (
                              <span className="text-xs text-red-500 font-medium">Inactivo</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Toggle activo */}
                      <button
                        onClick={() => handleToggleRolActivo(rol.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          rol.activo
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={rol.activo ? 'Desactivar rol' : 'Activar rol'}
                      >
                        <Power className="h-4 w-4" />
                      </button>
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
                      {rol.activo ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                          Inactivo
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
                      <button
                        onClick={() => handleDeleteRol(rol)}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 ml-2"
                        title="Eliminar rol"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                  Matriz de permisos por rol. Solo se muestran los roles activos ({rolesActivos.length} de {roles.length} roles).
                </p>
              </div>

              {rolesActivos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Power className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No hay roles activos para mostrar en la matriz.</p>
                  <p className="text-sm mt-1">Active al menos un rol en la pestaña "Roles".</p>
                </div>
              ) : (
                /* Matrix Table */
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-white">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase sticky left-0 bg-gray-900 z-10">
                          Módulo / Funcionalidad
                        </th>
                        {rolesActivos.map((rol) => (
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
                              colSpan={rolesActivos.length + 1}
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
                                {rolesActivos.map((rol) => {
                                  // Use stored permissions for custom roles, otherwise generate mock permissions
                                  const permisos = rol.permisosConfig || generarPermisosRol(rol.id);
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
              )}
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
                {/* Warning: Users affected */}
                {editingRol && getUsuariosByRol(editingRol.id).length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-800">
                          Advertencia: Este rol tiene {getUsuariosByRol(editingRol.id).length} usuario(s) asignado(s)
                        </h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Los cambios en los permisos afectarán a los siguientes usuarios:
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {getUsuariosByRol(editingRol.id).map(u => (
                            <span
                              key={u.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded-full text-xs font-medium text-amber-800"
                            >
                              <User className="h-3 w-3" />
                              {u.nombreCompleto}
                            </span>
                          ))}
                        </div>

                        {/* Option to reassign users */}
                        <div className="mt-4 pt-4 border-t border-amber-200">
                          <button
                            onClick={() => setShowReassignSection(!showReassignSection)}
                            className="text-sm text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1"
                          >
                            <UserMinus className="h-4 w-4" />
                            {showReassignSection ? 'Ocultar opciones de reasignación' : 'Mover usuarios a otro rol antes de editar'}
                          </button>

                          {showReassignSection && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200">
                              <p className="text-xs text-gray-600 mb-2">
                                Seleccione el rol al que desea mover los usuarios:
                              </p>
                              <div className="flex items-center gap-2">
                                <select
                                  value={reassignToRolId || ''}
                                  onChange={(e) => setReassignToRolId(e.target.value ? Number(e.target.value) : null)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                                >
                                  <option value="">Seleccionar rol destino...</option>
                                  {roles.filter(r => r.id !== editingRol.id && r.activo).map(r => (
                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => {
                                    if (reassignToRolId) {
                                      // Move users to new role
                                      const targetRol = roles.find(r => r.id === reassignToRolId);
                                      setUsuarios(usuarios.map(u =>
                                        u.rolId === editingRol.id
                                          ? { ...u, rolId: reassignToRolId, rol: targetRol?.nombre || u.rol }
                                          : u
                                      ));
                                      // Update role user counts
                                      const usersToMove = getUsuariosByRol(editingRol.id).length;
                                      setRoles(roles.map(r => {
                                        if (r.id === editingRol.id) return { ...r, usuarios: 0 };
                                        if (r.id === reassignToRolId) return { ...r, usuarios: r.usuarios + usersToMove };
                                        return r;
                                      }));
                                      setReassignToRolId(null);
                                      setShowReassignSection(false);
                                    }
                                  }}
                                  disabled={!reassignToRolId}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                    reassignToRolId
                                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                  Mover
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                  setReassignToRolId(null);
                  setShowReassignSection(false);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newRol.nombre.trim()) {
                    if (editingRol) {
                      // Editar rol existente
                      setRoles(roles.map(r =>
                        r.id === editingRol.id
                          ? {
                              ...r,
                              nombre: newRol.nombre,
                              descripcion: newRol.descripcion,
                              color: newRol.color,
                              permisos: Object.values(newRol.permisos).filter(p => p.ver || p.crear || p.editar || p.eliminar).length,
                              permisosConfig: { ...newRol.permisos },
                            }
                          : r
                      ));
                    } else {
                      // Crear nuevo rol
                      const nuevoRol: Rol = {
                        id: Math.max(...roles.map(r => r.id)) + 1,
                        nombre: newRol.nombre,
                        descripcion: newRol.descripcion,
                        color: newRol.color,
                        icono: 'shield',
                        usuarios: 0,
                        permisos: Object.values(newRol.permisos).filter(p => p.ver || p.crear || p.editar || p.eliminar).length,
                        predefinido: false,
                        activo: true,
                        permisosConfig: { ...newRol.permisos },
                      };
                      setRoles([...roles, nuevoRol]);
                    }
                    // Reset form
                    setNewRol({ nombre: '', descripcion: '', color: '#3182ce', permisos: {} });
                  }
                  setShowNewRolModal(false);
                  setEditingRol(null);
                  setReassignToRolId(null);
                  setShowReassignSection(false);
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
                  {roles.map((rol) => (
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

      {/* Modal Confirmación Eliminar Rol */}
      {deleteConfirmRol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Rol</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">
              ¿Está seguro que desea eliminar el rol <span className="font-semibold">"{deleteConfirmRol.nombre}"</span>?
            </p>

            {deleteConfirmRol.predefinido && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-800">
                  <strong>¡Atención!</strong> Este es un rol predefinido del sistema.
                  Eliminarlo puede afectar el funcionamiento normal de la aplicación.
                </p>
              </div>
            )}

            {getUsuariosByRol(deleteConfirmRol.id).length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <p className="text-sm text-amber-800 mb-2">
                  <strong>Advertencia:</strong> Este rol tiene {getUsuariosByRol(deleteConfirmRol.id).length} usuario(s) asignado(s):
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getUsuariosByRol(deleteConfirmRol.id).map(u => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-amber-200 rounded text-xs text-amber-800"
                    >
                      <User className="h-3 w-3" />
                      {u.nombreCompleto}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-amber-800 mt-3">
                  Debe reasignar estos usuarios a otro rol antes de eliminar.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmRol(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteRol}
                disabled={getUsuariosByRol(deleteConfirmRol.id).length > 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  getUsuariosByRol(deleteConfirmRol.id).length > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar Rol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
