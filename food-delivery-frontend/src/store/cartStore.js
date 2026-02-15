import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getLineItemKey = (item) => `${item.id}:${item.restaurant_id || 'restaurant'}`;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      isOpen: false,
      promo: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item) => {
        const state = get();
        const lineItemKey = getLineItemKey(item);

        if (state.restaurantId && item.restaurant_id && state.restaurantId !== item.restaurant_id) {
          set({
            items: [{ ...item, quantity: 1, lineItemKey }],
            restaurantId: item.restaurant_id,
            promo: null,
            isOpen: false,
          });
          return;
        }

        const nextRestaurantId = state.restaurantId || item.restaurant_id || null;
        const existing = state.items.find((cartItem) => cartItem.lineItemKey === lineItemKey);

        if (existing) {
          set({
            items: state.items.map((cartItem) =>
              cartItem.lineItemKey === lineItemKey ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            ),
            restaurantId: nextRestaurantId,
            promo: null,
            isOpen: false,
          });
          return;
        }

        set({
          items: [...state.items, { ...item, quantity: 1, lineItemKey }],
          restaurantId: nextRestaurantId,
          promo: null,
          isOpen: false,
        });
      },

      setItemQuantity: (lineItemKey, quantity) =>
        set((state) => {
          const parsedQuantity = Math.max(0, Number(quantity) || 0);
          const nextItems = state.items
            .map((item) => (item.lineItemKey === lineItemKey ? { ...item, quantity: parsedQuantity } : item))
            .filter((item) => item.quantity > 0);

          return {
            items: nextItems,
            restaurantId: nextItems.length ? state.restaurantId : null,
            promo: null,
          };
        }),

      decrementItem: (lineItemKey) =>
        set((state) => {
          const nextItems = state.items
            .map((item) => (item.lineItemKey === lineItemKey ? { ...item, quantity: item.quantity - 1 } : item))
            .filter((item) => item.quantity > 0);

          return {
            items: nextItems,
            restaurantId: nextItems.length ? state.restaurantId : null,
            promo: null,
          };
        }),

      removeItem: (lineItemKey) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.lineItemKey !== lineItemKey);
          return {
            items: nextItems,
            restaurantId: nextItems.length ? state.restaurantId : null,
            promo: null,
          };
        }),

      setPromo: (promo) => set({ promo }),
      clearPromo: () => set({ promo: null }),

      clearCart: () => set({ items: [], restaurantId: null, promo: null }),
    }),
    {
      name: 'food_delivery_cart',
      partialize: (state) => ({
        items: state.items,
        restaurantId: state.restaurantId,
        promo: state.promo,
      }),
    }
  )
);
