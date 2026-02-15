export const roleRedirectMap = {
  customer: '/restaurants',
  restaurant_owner: '/my-restaurant',
  restaurantowner: '/my-restaurant',
  delivery_partner: '/my-deliveries',
  deliverypartner: '/my-deliveries',
  admin: '/admin',
};

export const normalizeRole = (role) => String(role || '').toLowerCase().replace(/\s+/g, '_');

export const getHomePathByRole = (role) => {
  if (!role) {
    return '/login';
  }

  const normalizedRole = normalizeRole(role);

  return roleRedirectMap[normalizedRole] || '/restaurants';
};
