import { create } from 'zustand';
import { authApi } from '../api/authApi';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({
        user: { id: data.userId, email: data.email, displayName: data.displayName, role: data.role },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, displayName, experienceLevel, initialBalance) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register(email, password, displayName, experienceLevel, initialBalance);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({
        user: { id: data.userId, email: data.email, displayName: data.displayName, role: data.role },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  loadUser: async () => {
    if (!get().accessToken) return;
    try {
      const { data } = await authApi.getProfile();
      set({ user: data, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
