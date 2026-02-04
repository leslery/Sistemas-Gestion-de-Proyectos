import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationPanel from './NotificationPanel';
import GlobalSearch from './GlobalSearch';
import HelpPanel from './HelpPanel';
import { currentUser, notificationCount } from '../../data/mockData';

const roleLabels: Record<string, string> = {
  demandante: 'Demandante',
  analista_td: 'Analista TD',
  jefe_td: 'Jefe TD',
  comite_expertos: 'Comité de Expertos',
  cgedx: 'CGEDx',
  administrador: 'PMO Manager',
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
  const [searchValue, setSearchValue] = useState('');

  // Use demo data if in demo mode
  const isDemoMode = localStorage.getItem('token')?.startsWith('dev-token-');
  const displayUnreadCount = isDemoMode ? notificationCount : unreadCount;

  // Fetch notifications on mount
  useEffect(() => {
    if (!isDemoMode) {
      fetchNotifications();
    }
  }, [fetchNotifications, isDemoMode]);

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

  const getUserInitials = () => {
    if (isDemoMode) {
      return currentUser.avatar;
    }
    return `${user?.nombre?.charAt(0) || ''}${user?.apellido?.charAt(0) || ''}`;
  };

  const getUserName = () => {
    if (isDemoMode) {
      return `${currentUser.nombre} ${currentUser.apellido}`;
    }
    return `${user?.nombre || ''} ${user?.apellido || ''}`;
  };

  const getUserRole = () => {
    if (isDemoMode) {
      return currentUser.rolLabel;
    }
    return user?.rol ? roleLabels[user.rol] : '';
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-5 z-[1000] shadow-md"
        style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)' }}>
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Menu toggle button */}
          <button
            onClick={onToggleSidebar}
            className="bg-transparent border-none text-white text-xl cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center font-bold text-lg"
              style={{ color: '#1a365d' }}>
              SGI
            </div>
            <div className="hidden sm:block">
              <div className="text-[1.3rem] font-medium leading-tight">Sistema de Gestión</div>
              <div className="text-[0.9rem] font-light opacity-90">Iniciativas y Proyectos</div>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-5">
          {/* Search bar */}
          <div className="hidden md:block relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/70"></i>
            <input
              type="text"
              placeholder="Buscar proyectos, iniciativas..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setShowGlobalSearch(true)}
              className="py-2.5 pl-10 pr-4 border-none rounded-full text-white text-sm transition-all w-[250px] focus:w-[300px] focus:outline-none placeholder-white/70"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative border-none text-white w-10 h-10 rounded-[10px] cursor-pointer hover:bg-white/20 transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                title="Notificaciones"
              >
                <i className="fas fa-bell"></i>
                {displayUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-[0.7rem] min-w-[18px] px-1.5 py-0.5 rounded-full"
                    style={{ background: '#e53e3e' }}>
                    {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
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
                className="border-none text-white w-10 h-10 rounded-[10px] cursor-pointer hover:bg-white/20 transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                title="Ayuda"
              >
                <i className="fas fa-question-circle"></i>
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
              className="flex items-center gap-2.5 py-1 pl-1 pr-4 rounded-full cursor-pointer hover:bg-white/20 transition-colors border-none"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ background: '#3182ce' }}>
                {getUserInitials()}
              </div>
              <div className="text-left text-white hidden md:block">
                <div className="text-[0.9rem] font-medium">
                  {getUserName()}
                </div>
                <div className="text-[0.75rem] opacity-80">
                  {getUserRole()}
                </div>
              </div>
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
                      {getUserName()}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {isDemoMode ? currentUser.email : user?.email}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#3182ce' }}>
                      {getUserRole()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/configuracion');
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i className="fas fa-user mr-3 text-gray-400"></i>
                    Mi Perfil
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-red-50 transition-colors"
                      style={{ color: '#e53e3e' }}
                    >
                      <i className="fas fa-sign-out-alt mr-3"></i>
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
