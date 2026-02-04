import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationPanel from './NotificationPanel';
import GlobalSearch from './GlobalSearch';
import HelpPanel from './HelpPanel';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Search,
  HelpCircle,
  Command,
} from 'lucide-react';

const roleLabels: Record<string, string> = {
  demandante: 'Demandante',
  analista_td: 'Analista TD',
  jefe_td: 'Jefe TD',
  comite_expertos: 'Comité de Expertos',
  cgedx: 'CGEDx',
  administrador: 'Administrador',
};

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
      // Ctrl/Cmd + / for help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[60px] gradient-header flex items-center justify-between px-5 z-[1000] shadow-md">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Menu toggle button */}
          <button
            onClick={onToggleSidebar}
            className="bg-transparent border-none text-white text-2xl cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-lg">
              SGI
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-medium">Sistema de Gestión</div>
              <div className="text-sm font-light opacity-90">Iniciativas y Proyectos</div>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-5">
          {/* Search bar - triggers global search */}
          <button
            onClick={() => setShowGlobalSearch(true)}
            className="hidden md:flex items-center gap-2 py-2.5 px-4 bg-white/15 hover:bg-white/25 rounded-full text-white text-sm transition-all w-[250px] text-left"
          >
            <Search className="h-4 w-4 text-white/70" />
            <span className="flex-1 text-white/70">Buscar...</span>
            <span className="flex items-center gap-0.5 text-xs text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
              <Command className="h-3 w-3" />K
            </span>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-white/10 border-none text-white w-10 h-10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
              >
                <Bell className="h-5 w-5 mx-auto" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-danger text-white text-[0.7rem] min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* Help */}
            <div className="relative">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="bg-white/10 border-none text-white w-10 h-10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
              >
                <HelpCircle className="h-5 w-5 mx-auto" />
              </button>

              <HelpPanel
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
              />
            </div>
          </div>

          {/* User profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 py-1 pl-1 pr-4 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors border-none"
            >
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-medium text-sm">
                {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
              </div>
              <div className="text-left text-white hidden md:block">
                <div className="text-sm font-medium">
                  {user?.nombre} {user?.apellido}
                </div>
                <div className="text-xs opacity-80">
                  {user?.rol && roleLabels[user.rol]}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-white/70 hidden md:block" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.nombre} {user?.apellido}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{user?.email}</div>
                    <div className="text-xs text-accent mt-1">
                      {user?.rol && roleLabels[user.rol]}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/configuracion');
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    Mi Perfil
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
    </>
  );
}
