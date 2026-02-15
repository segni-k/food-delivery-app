import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import LandingPage from './pages/LandingPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyRestaurantPage from './pages/MyRestaurantPage';
import MyDeliveriesPage from './pages/MyDeliveriesPage';
import MenuItemsPage from './pages/MenuItemsPage';
import MenuItemDetailPage from './pages/MenuItemDetailPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UserProfilePage from './pages/UserProfilePage';
import RoleRoute from './components/RoleRoute';
import PublicRoute from './components/PublicRoute';
import GlobalApiLoadingIndicator from './components/GlobalApiLoadingIndicator';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './store/authStore';
import { getHomePathByRole } from './utils/roleRedirect';

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
