import { create } from 'zustand';
import { authService } from '../services/authService';
import { setAuthToken } from '../api/axios';

const TOKEN_STORAGE_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
const storedUser = localStorage.getItem(USER_STORAGE_KEY);

if (storedToken) {
  setAuthToken(storedToken);
}

export const useAuthStore = create((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const data = await authService.login(payload);
      const token = data?.token;
      const user = data?.user;

      if (!token || !user) {
        throw new Error('Invalid authentication response.');
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      setAuthToken(token);

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { token, user };
    } catch (error) {
      set({
        error: error?.message || 'Login failed.',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const data = await authService.register(payload);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error?.message || 'Registration failed.',
        isLoading: false,
      });
      throw error;
    }
  },

  forgotPassword: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.forgotPassword(payload);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({
        error: error?.message || 'Password reset request failed.',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      if (get().token) {
        await authService.logout();
      }
    } catch (_error) {
      // Always clear local session even if server logout fails.
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setAuthToken(null);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
