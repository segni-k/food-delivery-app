import { create } from 'zustand';

export const useApiUiStore = create((set, get) => ({
  pendingRequests: 0,

  startRequest: () =>
    set((state) => ({
      pendingRequests: state.pendingRequests + 1,
    })),

  finishRequest: () =>
    set((state) => ({
      pendingRequests: Math.max(0, state.pendingRequests - 1),
    })),

  resetRequests: () => set({ pendingRequests: 0 }),

  isLoading: () => get().pendingRequests > 0,
}));

