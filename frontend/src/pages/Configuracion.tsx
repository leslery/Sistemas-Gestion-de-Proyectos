import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usuariosService } from '../services/api';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import { Select } from '../components/common/Input';
import { User, Users, Building, Shield, Plus } from 'lucide-react';

const roleLabels: Record<string, string> = {
  demandante: 'Demandante',
  analista_td: 'Analista TD',
  jefe_td: 'Jefe TD',
  comite_expertos: 'Comité de Expertos',
  cgedx: 'CGEDx',
  administrador: 'Administrador',
};

export default function Configuracion() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('perfil');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewAreaModal, setShowNewAreaModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'demandante',
    area_id: '',
  });
  const [newArea, setNewArea] = useState({ nombre: '', codigo: '', descripcion: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'usuarios') loadUsuarios();
    if (activeTab === 'areas') loadAreas();
  }, [activeTab]);

  const loadUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAreas = async () => {
    setIsLoading(true);
    try {
      const data = await usuariosService.getAreas();
      setAreas(data);
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await usuariosService.create({
        ...newUser,
        area_id: newUser.area_id ? parseInt(newUser.area_id) : null,
      });
      setShowNewUserModal(false);
      setNewUser({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        rol: 'demandante',
        area_id: '',
      });
      loadUsuarios();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleCreateArea = async () => {
    if (!newArea.codigo || !newArea.nombre) {
      return;
    }
    try {
      await usuariosService.createArea(newArea);
      setShowNewAreaModal(false);
      setNewArea({ nombre: '', codigo: '', descripcion: '' });
      loadAreas();
    } catch (error) {
      console.error('Error creating area:', error);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await usuariosService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Contraseña cambiada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error.response?.data?.detail || 'Error al cambiar la contraseña');
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Mi Perfil', icon: User },
    ...(user?.rol === 'administrador'
      ? [
          { id: 'usuarios', label: 'Usuarios', icon: Users },
          { id: 'areas', label: 'Áreas', icon: Building },
        ]
      : []),
  ];

  const rolOptions = Object.entries(roleLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const areaOptions = areas.map((a) => ({ value: a.id.toString(), label: a.nombre }));

  const usuariosColumns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (item: any) => `${item.nombre} ${item.apellido}`,
    },
    { key: 'email', header: 'Email' },
    {
      key: 'rol',
      header: 'Rol',
      render: (item: any) => <Badge>{roleLabels[item.rol] || item.rol}</Badge>,
    },
    {
      key: 'area',
      header: 'Área',
      render: (item: any) => item.area?.nombre || '-',
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (item: any) => (
        <Badge variant={item.activo ? 'success' : 'danger'}>
          {item.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  const areasColumns = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción' },
    {
      key: 'activa',
      header: 'Estado',
      render: (item: any) => (
        <Badge variant={item.activa ? 'success' : 'danger'}>
          {item.activa ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Gestión del sistema y usuarios</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Información Personal" />
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.nombre?.charAt(0)}
                  {user?.apellido?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {user?.nombre} {user?.apellido}
                  </h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <Badge className="mt-2">
                    {user?.rol && roleLabels[user.rol]}
                  </Badge>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Área:</span>
                  <span className="ml-2 font-medium">
                    {user?.area?.nombre || 'No asignada'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Cargo:</span>
                  <span className="ml-2 font-medium">{user?.cargo || '-'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Teléfono:</span>
                  <span className="ml-2 font-medium">{user?.telefono || '-'}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Seguridad" />
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Para cambiar su contraseña, complete los campos a continuación.
              </p>
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  {passwordSuccess}
                </div>
              )}
              <Input
                label="Contraseña Actual"
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <Input
                label="Nueva Contraseña"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <Button onClick={handleChangePassword}>Cambiar Contraseña</Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <Card padding="none">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Usuarios del Sistema</h3>
            <Button onClick={() => setShowNewUserModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
          <Table
            columns={usuariosColumns}
            data={usuarios}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No hay usuarios registrados"
          />
        </Card>
      )}

      {activeTab === 'areas' && (
        <Card padding="none">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Áreas de la Organización</h3>
            <Button onClick={() => setShowNewAreaModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Área
            </Button>
          </div>
          <Table
            columns={areasColumns}
            data={areas}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No hay áreas registradas"
          />
        </Card>
      )}

      {/* Modal Nuevo Usuario */}
      <Modal
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        title="Crear Nuevo Usuario"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={newUser.nombre}
              onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
              required
            />
            <Input
              label="Apellido"
              value={newUser.apellido}
              onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <Select
            label="Rol"
            options={rolOptions}
            value={newUser.rol}
            onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
          />
          <Select
            label="Área"
            options={areaOptions}
            value={newUser.area_id}
            onChange={(e) => setNewUser({ ...newUser, area_id: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowNewUserModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateUser}>Crear Usuario</Button>
        </div>
      </Modal>

      {/* Modal Nueva Área */}
      <Modal
        isOpen={showNewAreaModal}
        onClose={() => setShowNewAreaModal(false)}
        title="Crear Nueva Área"
      >
        <div className="space-y-4">
          <Input
            label="Código"
            value={newArea.codigo}
            onChange={(e) => setNewArea({ ...newArea, codigo: e.target.value })}
            placeholder="Ej: TI, RRHH, FIN"
            required
          />
          <Input
            label="Nombre"
            value={newArea.nombre}
            onChange={(e) => setNewArea({ ...newArea, nombre: e.target.value })}
            placeholder="Ej: Tecnología de la Información"
            required
          />
          <Input
            label="Descripción"
            value={newArea.descripcion}
            onChange={(e) => setNewArea({ ...newArea, descripcion: e.target.value })}
            placeholder="Descripción del área..."
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowNewAreaModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateArea}>Crear Área</Button>
        </div>
      </Modal>
    </div>
  );
}
