import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  FileText,
  FolderKanban,
  ClipboardCheck,
  DollarSign,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useNotificationStore, NotificationType, NotificationCategory, Notification } from '../../store/notificationStore';

const typeIcons: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const typeColors: Record<NotificationType, string> = {
  info: 'text-blue-500 bg-blue-50',
  success: 'text-green-500 bg-green-50',
  warning: 'text-amber-500 bg-amber-50',
  error: 'text-red-500 bg-red-50',
};

const categoryIcons: Record<NotificationCategory, typeof Info> = {
  proyecto: FolderKanban,
  iniciativa: FileText,
  evaluacion: ClipboardCheck,
  presupuesto: DollarSign,
  sistema: Settings,
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  onClick: (notification: Notification) => void;
}

function NotificationItem({ notification, onMarkAsRead, onRemove, onClick }: NotificationItemProps) {
  const TypeIcon = typeIcons[notification.type];
  const CategoryIcon = categoryIcons[notification.category];

  return (
    <div
      className={clsx(
        'flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
        !notification.read && 'bg-blue-50/30'
      )}
      onClick={() => onClick(notification)}
    >
      {/* Icon */}
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', typeColors[notification.type])}>
        <TypeIcon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={clsx('text-sm font-medium text-gray-900 line-clamp-1', !notification.read && 'font-semibold')}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="p-1 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                title="Marcar como leída"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <CategoryIcon className="h-3 w-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">{notification.category}</span>
          <span className="text-gray-300">·</span>
          <span className="text-[10px] text-gray-400">{formatTimeAgo(notification.timestamp)}</span>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    fetchNotifications,
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-full mt-2 w-[380px] max-h-[calc(100vh-100px)] bg-white rounded-xl shadow-xl border border-gray-200 z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-accent text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                filter === 'all'
                  ? 'bg-accent text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                filter === 'unread'
                  ? 'bg-accent text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              No leídas
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium">No hay notificaciones</p>
              <p className="text-xs text-gray-400 mt-1">
                {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'Tu bandeja está vacía'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
                onClick={handleNotificationClick}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                navigate('/configuracion');
                onClose();
              }}
              className="w-full text-center text-xs text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Ver configuración de notificaciones
            </button>
          </div>
        )}
      </div>
    </>
  );
}
