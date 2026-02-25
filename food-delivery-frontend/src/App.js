import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RoleRoute from './components/RoleRoute';
import PublicRoute from './components/PublicRoute';
import GlobalApiLoadingIndicator from './components/GlobalApiLoadingIndicator';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './store/authStore';
import { getHomePathByRole } from './utils/roleRedirect';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const RestaurantsPage = lazy(() => import('./pages/RestaurantsPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const MyRestaurantPage = lazy(() => import('./pages/MyRestaurantPage'));
const MyDeliveriesPage = lazy(() => import('./pages/MyDeliveriesPage'));
const MenuItemsPage = lazy(() => import('./pages/MenuItemsPage'));
const MenuItemDetailPage = lazy(() => import('./pages/MenuItemDetailPage'));
const CustomerDashboardPage = lazy(() => import('./pages/CustomerDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));

const RootRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user?.role) {
    return <Navigate to={getHomePathByRole(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <>
      <GlobalApiLoadingIndicator />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-neutral-950" />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<RootRedirect />} />

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            <Route path="/restaurants" element={<RestaurantsPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
            <Route path="/menu-items/:id" element={<MenuItemDetailPage />} />

            <Route element={<RoleRoute allowedRoles={['customer']} />}>
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/orders/:id/confirmation" element={<OrderConfirmationPage />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={['customer', 'restaurant_owner', 'delivery_partner', 'admin', 'support', 'finance', 'operations']} />}>
              <Route path="/profile" element={<UserProfilePage />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={['restaurant_owner']} />}>
              <Route path="/my-restaurant" element={<MyRestaurantPage />} />
              <Route path="/menu-items" element={<MenuItemsPage />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={['delivery_partner']} />}>
              <Route path="/my-deliveries" element={<MyDeliveriesPage />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
};

export default App;
