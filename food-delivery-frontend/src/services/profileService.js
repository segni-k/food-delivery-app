import api from '../api/axios';

export const profileService = {
  async getProfile() {
    const { data } = await api.get('/profile');
    return data?.data;
  },

  async updateProfile(payload) {
    const { data } = await api.patch('/profile', payload);
    return data?.data;
  },

  async addAddress(payload) {
    const { data } = await api.post('/profile/addresses', payload);
    return data?.data;
  },

  async deleteAddress(addressId) {
    const { data } = await api.delete(`/profile/addresses/${addressId}`);
    return data;
  },

  async addPaymentCard(payload) {
    const { data } = await api.post('/profile/payment-cards', payload);
    return data?.data;
  },

  async deletePaymentCard(cardId) {
    const { data } = await api.delete(`/profile/payment-cards/${cardId}`);
    return data;
  },
};
