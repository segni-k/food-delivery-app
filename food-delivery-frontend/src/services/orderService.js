import api from '../api/axios';

const normalizeCollectionResponse = (responseData) => {
  const payload = responseData?.data;
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  const meta = payload?.meta || null;

  return { rows, meta };
};

export const orderService = {
  async validatePromoCode(payload) {
    const { data } = await api.post('/promo-codes/validate', payload);
    return data?.data;
  },

  async validateDeliveryZone(payload) {
    const { data } = await api.post('/delivery-zones/validate', payload);
    return data?.data;
  },

  async createOrder(payload) {
    const { data } = await api.post('/orders', payload);
    return data?.data;
  },

  async createPayment(payload) {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : null;
    const requestPayload = {
      ...payload,
      return_origin: payload?.return_origin || currentOrigin || undefined,
    };

    const { data } = await api.post('/payments', requestPayload);
    return data?.data;
  },

  async verifyPayment(paymentId) {
    const { data } = await api.post(`/payments/${paymentId}/verify`);
    return data?.data;
  },

  async submitReview(payload) {
    const { data } = await api.post('/reviews', payload);
    return data?.data;
  },

  async getOrders(params = {}) {
    const { data } = await api.get('/orders', { params });
    return normalizeCollectionResponse(data);
  },

  async getOrder(orderId) {
    const { data } = await api.get(`/orders/${orderId}`);
    return data?.data;
  },
};
