import { create } from 'zustand';
import type { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'Admin') return true;
    const { ROLE_PERMISSIONS } = require('@/types/auth.types');
    const perms: string[] = ROLE_PERMISSIONS[user.role] || [];
    return perms.includes('all') || perms.includes(permission);
  },
}));
