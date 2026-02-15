import { create } from 'zustand';

const nextId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useNotificationStore = create((set, get) => ({
  toasts: [],

  pushToast: ({ type = 'info', title = '', message = '', durationMs = 4000 }) => {
    const id = nextId();
    const toast = { id, type, title, message, durationMs };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    if (durationMs > 0) {
      window.setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((entry) => entry.id !== id),
        }));
      }, durationMs);
    }

    return id;
  },

  success: (message, title = 'Success') =>
    get().pushToast({ type: 'success', title, message, durationMs: 3500 }),

  error: (message, title = 'Error') =>
    get().pushToast({ type: 'error', title, message, durationMs: 5000 }),

  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((entry) => entry.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}));
