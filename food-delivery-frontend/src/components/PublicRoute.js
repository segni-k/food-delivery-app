import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getHomePathByRole } from '../utils/roleRedirect';

const PublicRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user?.role) {
    const next = new URLSearchParams(location.search).get('next');
    const safeNext = next && next.startsWith('/') ? next : null;
    return <Navigate to={safeNext || getHomePathByRole(user.role)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
