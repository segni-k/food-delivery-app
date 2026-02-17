import api from '../api/axios';

const normalizeCollectionResponse = (responseData) => {
  const payload = responseData?.data;
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  const meta = payload?.meta || null;

  return { rows, meta };
};

const toFormData = (payload = {}) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
      return;
    }
    if (typeof value === 'number') {
      formData.append(key, String(value));
      return;
    }
    formData.append(key, value);
  });
  return formData;
};

export const ownerService = {
  async getRestaurants(params = {}) {
    const { data } = await api.get('/restaurants', { params });
    return normalizeCollectionResponse(data);
  },

  async createRestaurant(payload) {
    const formData = toFormData(payload);
    const { data } = await api.post('/restaurants', formData);
    return data?.data;
  },

  async updateRestaurant(restaurantId, payload) {
    const hasFile = payload?.image instanceof File || payload?.banner_image instanceof File;
    if (!hasFile) {
      const { data } = await api.patch(`/restaurants/${restaurantId}`, payload);
      return data?.data;
    }

    const formData = toFormData(payload);
    formData.append('_method', 'PATCH');
    const { data } = await api.post(`/restaurants/${restaurantId}`, formData);
    return data?.data;
  },

  async getCategories(restaurantId) {
    const { data } = await api.get(`/restaurants/${restaurantId}/categories`);
    return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
  },

  async createCategory(restaurantId, payload) {
    const { data } = await api.post(`/restaurants/${restaurantId}/categories`, payload);
    return data?.data;
  },

  async updateCategory(restaurantId, categoryId, payload) {
    const { data } = await api.patch(`/restaurants/${restaurantId}/categories/${categoryId}`, payload);
    return data?.data;
  },

  async deleteCategory(restaurantId, categoryId) {
    const { data } = await api.delete(`/restaurants/${restaurantId}/categories/${categoryId}`);
    return data;
  },

  async getItems(restaurantId, params = {}) {
    const { data } = await api.get(`/restaurants/${restaurantId}/items`, { params });
    return normalizeCollectionResponse(data);
  },

  async createItem(restaurantId, payload) {
    const formData = toFormData(payload);
    const { data } = await api.post(`/restaurants/${restaurantId}/items`, formData);
    return data?.data;
  },

  async updateItem(restaurantId, itemId, payload) {
    const formData = toFormData(payload);
    formData.append('_method', 'PATCH');
    const { data } = await api.post(`/restaurants/${restaurantId}/items/${itemId}`, formData);
    return data?.data;
  },

  async deleteItem(restaurantId, itemId) {
    const { data } = await api.delete(`/restaurants/${restaurantId}/items/${itemId}`);
    return data;
  },

  async toggleItemAvailability(restaurantId, itemId, isAvailable) {
    const { data } = await api.patch(`/restaurants/${restaurantId}/items/${itemId}/availability`, {
      is_available: Boolean(isAvailable),
    });
    return data?.data;
  },

  async getOrders(params = {}) {
    const { data } = await api.get('/orders', { params });
    return normalizeCollectionResponse(data);
  },

  async updateOrderStatus(orderId, status) {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status });
    return data?.data;
  },

  async getDeliveryPartners() {
    const { data } = await api.get('/delivery-partners');
    return Array.isArray(data?.data) ? data.data : [];
  },

  async assignDeliveryPartner(orderId, payload) {
    const { data } = await api.post(`/orders/${orderId}/assign-delivery-partner`, payload);
    return data?.data;
  },
};
