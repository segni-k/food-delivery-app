import api from '../api/axios';

const normalizeCollectionResponse = (responseData) => {
  const payload = responseData?.data;
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  const meta = payload?.meta || null;

  return { rows, meta };
};

const CACHE_TTL_MS = 45 * 1000;
const readCache = new Map();

const normalizeParams = (params = {}) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => String(left).localeCompare(String(right)));

const cacheKey = (prefix, params = {}) => `${prefix}:${JSON.stringify(normalizeParams(params))}`;

const getCached = (key) => {
  const cached = readCache.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    readCache.delete(key);
    return null;
  }

  return cached.value;
};

const setCached = (key, value) => {
  readCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  return value;
};

export const restaurantService = {
  async getRestaurants(params = {}) {
    const key = cacheKey('restaurants', params);
    const cached = getCached(key);
    if (cached) {
      return cached;
    }

    const { data } = await api.get('/restaurants', { params });
    return setCached(key, normalizeCollectionResponse(data));
  },

  async getRestaurantById(restaurantId) {
    const key = cacheKey(`restaurant:${restaurantId}`);
    const cached = getCached(key);
    if (cached) {
      return cached;
    }

    const { data } = await api.get(`/restaurants/${restaurantId}`);
    return setCached(key, data?.data);
  },

  async getMenuItems(params = {}) {
    const key = cacheKey('menu-items', params);
    const cached = getCached(key);
    if (cached) {
      return cached;
    }

    const { data } = await api.get('/menu-items', { params });
    return setCached(key, normalizeCollectionResponse(data));
  },

  async getMenuItemById(menuItemId) {
    const key = cacheKey(`menu-item:${menuItemId}`);
    const cached = getCached(key);
    if (cached) {
      return cached;
    }

    const { data } = await api.get(`/menu-items/${menuItemId}`);
    return setCached(key, data?.data);
  },
};
