import { create } from 'zustand';
import { orderService } from '../services/orderService';

const upsertById = (list, item) => {
  if (!item?.id) {
    return list;
  }

  const exists = list.some((entry) => entry.id === item.id);
  if (!exists) {
    return [item, ...list];
  }

  return list.map((entry) => (entry.id === item.id ? { ...entry, ...item } : entry));
};

const isSamePayment = (left, right) => {
  if (!left && !right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }

  return (
    left.id === right.id &&
    left.status === right.status &&
    left.checkout_url === right.checkout_url &&
    left.gateway_transaction_ref === right.gateway_transaction_ref
  );
};

const isSameNotification = (left, right) => {
  if (!left && !right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }

  return left.status === right.status && left.message === right.message;
};

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrderId: null,
  paymentByOrderId: {},
  paymentNotificationByOrderId: {},
  isLoading: false,
  error: null,

  setOrders: (orders) => set({ orders: Array.isArray(orders) ? orders : [] }),

  upsertOrder: (order) =>
    set((state) => ({
      orders: upsertById(state.orders, order),
      currentOrderId: order?.id || state.currentOrderId,
    })),

  setCurrentOrder: (order) =>
    set((state) => ({
      orders: upsertById(state.orders, order),
      currentOrderId: order?.id || state.currentOrderId,
    })),

  getCurrentOrder: () => {
    const { orders, currentOrderId } = get();
    if (!currentOrderId) {
      return null;
    }
    return orders.find((order) => order.id === currentOrderId) || null;
  },

  setOrderPayment: (orderId, payment) =>
    set((state) => {
      const current = state.paymentByOrderId[orderId] || null;
      if (isSamePayment(current, payment)) {
        return state;
      }

      return {
        paymentByOrderId: {
          ...state.paymentByOrderId,
          [orderId]: payment,
        },
      };
    }),

  getOrderPayment: (orderId) => get().paymentByOrderId[orderId] || null,

  setPaymentNotification: (orderId, notification) =>
    set((state) => {
      const current = state.paymentNotificationByOrderId[orderId] || null;
      if (isSameNotification(current, notification)) {
        return state;
      }

      return {
        paymentNotificationByOrderId: {
          ...state.paymentNotificationByOrderId,
          [orderId]: notification,
        },
      };
    }),

  clearPaymentNotification: (orderId) =>
    set((state) => {
      const nextNotifications = { ...state.paymentNotificationByOrderId };
      delete nextNotifications[orderId];

      return {
        paymentNotificationByOrderId: nextNotifications,
      };
    }),

  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await orderService.getOrders(params);
      set({
        orders: result.rows || [],
        isLoading: false,
      });
      return result;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || 'Unable to fetch orders.',
      });
      throw error;
    }
  },

  fetchOrderById: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderService.getOrder(orderId);
      get().setCurrentOrder(order);
      set({ isLoading: false });
      return order;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || 'Unable to fetch order.',
      });
      throw error;
    }
  },

  createOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderService.createOrder(payload);
      get().setCurrentOrder(order);
      set({ isLoading: false });
      return order;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || 'Unable to create order.',
      });
      throw error;
    }
  },

  createPayment: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await orderService.createPayment({
        order_id: orderId,
        return_origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      });
      get().setOrderPayment(orderId, payment);
      set({ isLoading: false });
      return payment;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || 'Unable to create payment.',
      });
      throw error;
    }
  },

  verifyPaymentStatus: async (orderId, paymentId) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await orderService.verifyPayment(paymentId);
      get().setOrderPayment(orderId, payment);
      set({ isLoading: false });
      return payment;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || 'Unable to verify payment.',
      });
      throw error;
    }
  },
}));
