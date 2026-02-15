import axios from 'axios';
import { normalizeApiError } from '../utils';
import { toast } from 'react-toastify';
import { useApiUiStore } from '../store/apiUiStore';

const TOKEN_STORAGE_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'auth_token';
const USER_STORAGE_KEY = 'auth_user';
const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api/v1';
const rawApiBaseUrl = process.env.REACT_APP_API_URL || DEFAULT_API_BASE;
const normalizedApiBaseUrl = rawApiBaseUrl.endsWith('/api/v1')
  ? rawApiBaseUrl
  : `${rawApiBaseUrl.replace(/\/+$/, '')}/api/v1`;

const toAlternateApiBase = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost') {
      parsed.hostname = '127.0.0.1';
      return parsed.toString().replace(/\/+$/, '');
    }
    if (parsed.hostname === '127.0.0.1') {
      parsed.hostname = 'localhost';
      return parsed.toString().replace(/\/+$/, '');
    }
  } catch (_error) {
    return null;
  }

  return null;
};

const api = axios.create({
  baseURL: normalizedApiBaseUrl,
  timeout: Number(process.env.REACT_APP_API_TIMEOUT_MS || 15000),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

api.interceptors.request.use(
  (config) => {
    useApiUiStore.getState().startRequest();
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    useApiUiStore.getState().finishRequest();
    return response;
  },
  async (error) => {
    useApiUiStore.getState().finishRequest();

    if (error.response) {
      const { status, data } = error.response;
      const normalized = normalizeApiError({
        status,
        message: data?.message || 'Request failed.',
        errors: data?.errors || [],
        raw: error,
      });

      if (status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setAuthToken(null);
      }

      if (!error.config?.meta?.silentErrorToast && normalized.message) {
        toast.error(normalized.message);
      }

      return Promise.reject(normalized);
    }

    if (error.request) {
      const originalConfig = error.config || {};
      const alreadyRetried = Boolean(originalConfig.__hostRetryAttempted);

      if (!alreadyRetried) {
        const activeBase = originalConfig.baseURL || api.defaults.baseURL;
        const alternateBase = toAlternateApiBase(activeBase);

        if (alternateBase) {
          try {
            return await api.request({
              ...originalConfig,
              baseURL: alternateBase,
              __hostRetryAttempted: true,
            });
          } catch (_retryError) {
            // Continue to normalized network error below.
          }
        }
      }

      const normalized = normalizeApiError({
        status: 0,
        message: 'Network error. Please check your connection.',
        errors: [],
        raw: error,
      });

      if (!error.config?.meta?.silentErrorToast) {
        toast.error(normalized.message);
      }

      return Promise.reject(normalized);
    }

    const normalized = normalizeApiError({
      status: -1,
      message: error.message || 'Unexpected error.',
      errors: [],
      raw: error,
    });

    if (!error.config?.meta?.silentErrorToast) {
      toast.error(normalized.message);
    }

    return Promise.reject(normalized);
  }
);

export default api;
