import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getHomePathByRole, normalizeRole } from '../utils/roleRedirect';

const RoleRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (!allowedRoles.length) {
    return <Outlet />;
  }

  const currentRole = normalizeRole(user?.role);
  const allowed = allowedRoles.map((role) => normalizeRole(role));

  if (!allowed.includes(currentRole)) {
    return <Navigate to={getHomePathByRole(user?.role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
