import { create } from 'zustand';

export type NotificationType = 'inscription' | 'paiement' | 'rappel' | 'evenement' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

function loadNotifications(): AppNotification[] {
  try {
    const stored = localStorage.getItem('sf_notifications');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveNotifications(n: AppNotification[]) {
  localStorage.setItem('sf_notifications', JSON.stringify(n.slice(0, 100)));
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadNotifications(),

  addNotification: (n) => {
    const newNotif: AppNotification = {
      ...n,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...get().notifications].slice(0, 100);
    saveNotifications(updated);
    set({ notifications: updated });
  },

  markAsRead: (id) => {
    const updated = get().notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
    set({ notifications: updated });
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    set({ notifications: updated });
  },

  clearAll: () => {
    saveNotifications([]);
    set({ notifications: [] });
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
