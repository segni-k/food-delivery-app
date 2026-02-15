import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set) => ({
      address: '',
      latitude: null,
      longitude: null,
      source: 'manual',

      setLocation: ({ address, latitude, longitude, source = 'manual' }) =>
        set({
          address: address || '',
          latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : null,
          longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : null,
          source,
        }),

      clearLocation: () =>
        set({
          address: '',
          latitude: null,
          longitude: null,
          source: 'manual',
        }),
    }),
    {
      name: 'food_delivery_location',
    }
  )
);

