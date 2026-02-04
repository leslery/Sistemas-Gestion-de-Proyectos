import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'proyecto' | 'iniciativa' | 'evaluacion' | 'sistema' | 'presupuesto';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  timestamp: Date;
  link?: string;
  entityId?: number;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
}

// Generate unique ID
const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: generateId(),
    title: 'Nueva iniciativa pendiente',
    message: 'Se ha recibido una nueva iniciativa "Modernización ERP" que requiere tu revisión.',
    type: 'info',
    category: 'iniciativa',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    link: '/iniciativas',
    entityId: 1,
  },
  {
    id: generateId(),
    title: 'Proyecto aprobado',
    message: 'El proyecto "Sistema de Facturación" ha sido aprobado y está listo para activación.',
    type: 'success',
    category: 'proyecto',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    link: '/proyectos/1',
    entityId: 1,
  },
  {
    id: generateId(),
    title: 'Alerta de presupuesto',
    message: 'El proyecto "Migración Cloud" ha superado el 80% del presupuesto asignado.',
    type: 'warning',
    category: 'presupuesto',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    link: '/seguimiento/presupuesto',
    entityId: 2,
  },
  {
    id: generateId(),
    title: 'Evaluación completada',
    message: 'La evaluación del comité para "Automatización Procesos" ha finalizado.',
    type: 'success',
    category: 'evaluacion',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    link: '/evaluaciones',
    entityId: 3,
  },
  {
    id: generateId(),
    title: 'Mantenimiento programado',
    message: 'El sistema estará en mantenimiento el próximo domingo de 2:00 a 6:00 AM.',
    type: 'info',
    category: 'sistema',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  fetchNotifications: async () => {
    set({ isLoading: true });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In real app, this would fetch from backend
    const unreadCount = mockNotifications.filter((n) => !n.read).length;

    set({
      notifications: mockNotifications,
      unreadCount,
      isLoading: false,
    });
  },
}));
