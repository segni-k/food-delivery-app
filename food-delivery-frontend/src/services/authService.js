import api from '../api/axios';

export const authService = {
  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data?.data;
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data?.data;
  },

  forgotPassword: async (payload) => {
    const { data } = await api.post('/auth/forgot-password', payload);
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};
