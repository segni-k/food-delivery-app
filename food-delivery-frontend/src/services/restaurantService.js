import api from '../api/axios';

const normalizeCollectionResponse = (responseData) => {
  const payload = responseData?.data;
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  const meta = payload?.meta || null;

  return { rows, meta };
};

export const restaurantService = {
  async getRestaurants(params = {}) {
    const { data } = await api.get('/restaurants', { params });
    return normalizeCollectionResponse(data);
  },

  async getRestaurantById(restaurantId) {
    const { data } = await api.get(`/restaurants/${restaurantId}`);
    return data?.data;
  },

  async getMenuItems(params = {}) {
    const { data } = await api.get('/menu-items', { params });
    return normalizeCollectionResponse(data);
  },

  async getMenuItemById(menuItemId) {
    const { data } = await api.get(`/menu-items/${menuItemId}`);
    return data?.data;
  },
};
