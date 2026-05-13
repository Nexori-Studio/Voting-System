import { create } from 'zustand';
import { authApi, type User } from '@/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        set({ user: response.data.user, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: response.error || '登录失败' };
    } catch {
      return { success: false, error: '网络错误' };
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.register(username, email, password);
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.error || '注册失败' };
    } catch {
      return { success: false, error: '网络错误' };
    }
  },

  logout: async () => {
    await authApi.logout();
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        set({ user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
