import api from '../api/axios';

const normalizeCollectionResponse = (responseData) => {
  const payload = responseData?.data;
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  const meta = payload?.meta || null;

  return { rows, meta };
};

export const deliveryService = {
  async getMyDeliveries(params = {}) {
    const { data } = await api.get('/my-deliveries', { params });
    return normalizeCollectionResponse(data);
  },

  async respondToAssignment(orderId, action) {
    const { data } = await api.post(`/orders/${orderId}/assign`, { action });
    return data?.data;
  },

  async updateDeliveryStatus(orderId, status) {
    const { data } = await api.patch(`/orders/${orderId}/delivery-status`, { status });
    return data?.data;
  },
};

