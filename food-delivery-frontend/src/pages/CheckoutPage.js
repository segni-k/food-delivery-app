import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AppShell from '../components/AppShell';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useLocationStore } from '../store/locationStore';
import { orderService } from '../services/orderService';
import { locationService } from '../services/locationService';
import { restaurantService } from '../services/restaurantService';
import { profileService } from '../services/profileService';

const checkoutSchema = z.object({
  delivery_address: z.string().min(6, 'Enter a complete delivery address.'),
  landmark: z.string().max(120, 'Landmark should be short.').optional().or(z.literal('')),
  drop_off_preference: z.enum(['door', 'gate', 'lobby']),
  notes: z.string().max(250).optional().or(z.literal('')),
});

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

const priorityThemeByTier = {
  fast_lane: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  standard: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  out_of_zone: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const composeDeliveryNotes = ({ landmark, dropOffPreference, notes }) => {
  const tokens = [];

  if (dropOffPreference) {
    tokens.push(`Drop-off: ${dropOffPreference}`);
  }
  if (landmark) {
    tokens.push(`Landmark: ${landmark}`);
  }
  if (notes) {
    tokens.push(`Notes: ${notes}`);
  }

  return tokens.join(' | ');
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const promo = useCartStore((state) => state.promo);
  const clearCart = useCartStore((state) => state.clearCart);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const setOrderPayment = useOrderStore((state) => state.setOrderPayment);

  const locationAddress = useLocationStore((state) => state.address);
  const locationLatitude = useLocationStore((state) => state.latitude);
  const locationLongitude = useLocationStore((state) => state.longitude);
  const setLocation = useLocationStore((state) => state.setLocation);

  const [zoneCheck, setZoneCheck] = useState(null);
  const [zoneError, setZoneError] = useState('');
  const [isValidatingZone, setIsValidatingZone] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [restaurantSummary, setRestaurantSummary] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [coords, setCoords] = useState({
    latitude: locationLatitude,
    longitude: locationLongitude,
  });

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [items]
  );
  const discount = Number(promo?.discount_amount || 0);
  const deliveryFee = Number(zoneCheck?.estimated_delivery_fee || 0);
  const total = Math.max(subtotal + deliveryFee - discount, 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_address: locationAddress || '',
      landmark: '',
      drop_off_preference: 'door',
      notes: '',
    },
  });

  const watchedAddress = watch('delivery_address');

  useEffect(() => {
    setRecentLocations(locationService.getRecentLocations());

    let isActive = true;
    profileService
      .getProfile()
      .then((profile) => {
        if (!isActive) {
          return;
        }
        const addresses = Array.isArray(profile?.addresses) ? profile.addresses : [];
        setSavedAddresses(addresses);
      })
      .catch(() => {
        if (isActive) {
          setSavedAddresses([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!watchedAddress) {
      return;
    }

    if (locationAddress && watchedAddress.trim() === locationAddress.trim()) {
      return;
    }

    setCoords({ latitude: null, longitude: null });
    setZoneCheck(null);
  }, [locationAddress, watchedAddress]);

  useEffect(() => {
    let isActive = true;

    const loadRestaurantSummary = async () => {
      if (!restaurantId) {
        return;
      }

      try {
        const result = await restaurantService.getRestaurantById(restaurantId);
        if (!isActive) {
          return;
        }
        setRestaurantSummary(result);
      } catch (_error) {
        if (isActive) {
          setRestaurantSummary(null);
        }
      }
    };

    loadRestaurantSummary();

    return () => {
      isActive = false;
    };
  }, [restaurantId]);

  const resolveCoordinatesForAddress = async (address) => {
    const geocoded = await locationService.geocodeAddress(address);
    const normalizedAddress = geocoded.normalizedAddress || address;
    const nextCoords = {
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
    };
    setCoords(nextCoords);
    setLocation({
      address: normalizedAddress,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      source: 'manual',
    });
    locationService.saveRecentLocation(normalizedAddress);
    setRecentLocations(locationService.getRecentLocations());
    return nextCoords;
  };

  const validateZone = async (targetAddress) => {
    if (!restaurantId) {
      return;
    }

    setIsValidatingZone(true);
    setZoneError('');
    setLocationMessage('');

    try {
      const activeCoords =
        Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)
          ? coords
          : await resolveCoordinatesForAddress(targetAddress || watchedAddress);

      const result = await orderService.validateDeliveryZone({
        restaurant_id: restaurantId,
        delivery_latitude: activeCoords.latitude,
        delivery_longitude: activeCoords.longitude,
      });
      setZoneCheck(result);
    } catch (error) {
      setZoneCheck(null);
      setZoneError(error?.message || 'Unable to validate delivery zone.');
    } finally {
      setIsValidatingZone(false);
    }
  };

  const useCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setLocationMessage('');
    setZoneError('');
    try {
      const detected = await locationService.detectBrowserLocation();
      const detectedAddress = await locationService.reverseGeocode(detected.latitude, detected.longitude);
      setValue('delivery_address', detectedAddress);
      setCoords({
        latitude: detected.latitude,
        longitude: detected.longitude,
      });
      setLocation({
        address: detectedAddress,
        latitude: detected.latitude,
        longitude: detected.longitude,
        source: 'auto',
      });
      locationService.saveRecentLocation(detectedAddress);
      setRecentLocations(locationService.getRecentLocations());
      setLocationMessage('Using your current location.');
      await validateZone(detectedAddress);
    } catch (error) {
      setLocationMessage(error?.message || 'Unable to use current location.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const onSubmit = async (values) => {
    if (!items.length || !restaurantId) {
      return;
    }

    setSubmitError('');
    setIsSubmittingOrder(true);

    try {
      const activeCoords =
        Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)
          ? coords
          : await resolveCoordinatesForAddress(values.delivery_address);

      const zoneResult = zoneCheck || (await orderService.validateDeliveryZone({
        restaurant_id: restaurantId,
        delivery_latitude: activeCoords.latitude,
        delivery_longitude: activeCoords.longitude,
      }));

      if (!zoneResult?.within_zone) {
        setZoneCheck(zoneResult || null);
        setSubmitError('Delivery address is currently outside this restaurant\'s delivery zone.');
        return;
      }

      const notes = composeDeliveryNotes({
        landmark: values.landmark,
        dropOffPreference: values.drop_off_preference,
        notes: values.notes,
      });

      const existingAddress = savedAddresses.find(
        (entry) => entry.address_line?.trim().toLowerCase() === values.delivery_address.trim().toLowerCase()
      );
      if (!existingAddress) {
        await profileService.addAddress({
          label: 'Delivery',
          address_line: values.delivery_address,
          latitude: activeCoords.latitude,
          longitude: activeCoords.longitude,
          is_default: false,
        });
      }

      const order = await orderService.createOrder({
        restaurant_id: restaurantId,
        delivery_address: values.delivery_address,
        delivery_latitude: activeCoords.latitude,
        delivery_longitude: activeCoords.longitude,
        notes: notes || undefined,
        promo_code: promo?.code || undefined,
        items: items.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
      });

      const payment = await orderService.createPayment({
        order_id: order.id,
        return_origin: window.location.origin,
      });

      setCurrentOrder(order);
      setOrderPayment(order.id, payment);
      clearCart();
      navigate(`/orders/${order.id}/confirmation`, {
        replace: true,
        state: { order, payment },
      });
    } catch (error) {
      setSubmitError(error?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!items.length || !restaurantId) {
    return (
      <AppShell title="Checkout" subtitle="Your cart is empty. Add items before checkout.">
        <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Link
            to="/restaurants"
            className="inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Back to restaurants
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="Checkout" subtitle="Confirm destination, validate zone intelligence, and launch payment.">
      <div className="grid gap-5 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95 lg:col-span-2"
        >
          <section className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 dark:border-orange-400/20 dark:bg-orange-500/10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">Delivery form</p>
            <h2 className="mt-1 text-lg font-black">Destination details</h2>

            <label className="mb-1 mt-4 block text-sm font-medium">Delivery address</label>
            <input
              {...register('delivery_address')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
              placeholder="Bole, Addis Ababa, near Edna Mall"
            />
            {errors.delivery_address ? <p className="mt-1 text-xs text-red-600">{errors.delivery_address.message}</p> : null}

            {recentLocations.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {recentLocations.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => {
                      setValue('delivery_address', entry);
                      setZoneCheck(null);
                    }}
                    className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    {entry}
                  </button>
                ))}
              </div>
            ) : null}
            {savedAddresses.length ? (
              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Saved addresses</p>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setValue('delivery_address', entry.address_line);
                        setCoords({
                          latitude: Number(entry.latitude),
                          longitude: Number(entry.longitude),
                        });
                        setZoneCheck(null);
                      }}
                      className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      {entry.label || 'Address'}: {entry.address_line}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Landmark (optional)</label>
                <input
                  {...register('landmark')}
                  placeholder="Blue gate, Wollo Sefer"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Drop-off preference</label>
                <select
                  {...register('drop_off_preference')}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
                >
                  <option value="door">At my door</option>
                  <option value="gate">At building gate</option>
                  <option value="lobby">At reception/lobby</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={isDetectingLocation}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              {isDetectingLocation ? 'Detecting location...' : 'Use my current location'}
            </button>
            <button
              type="button"
              onClick={() => validateZone()}
              disabled={isValidatingZone}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              {isValidatingZone ? 'Validating...' : 'Validate delivery zone'}
            </button>
          </div>

          {zoneCheck ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    priorityThemeByTier[zoneCheck.priority_tier] || priorityThemeByTier.standard
                  }`}
                >
                  {zoneCheck.priority_tier === 'fast_lane'
                    ? 'Fast lane'
                    : zoneCheck.priority_tier === 'out_of_zone'
                    ? 'Out of zone'
                    : 'Standard lane'}
                </p>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Route efficiency: {zoneCheck.route_efficiency_score ?? 0}/100
                </p>
              </div>
              <p className="mt-2 text-sm font-semibold">
                {zoneCheck.within_zone
                  ? `Deliverable in ${zoneCheck.zone_name} (${zoneCheck.distance_km} km from restaurant)`
                  : `This restaurant currently delivers around ${zoneCheck.zone_name} within ${zoneCheck.max_radius_km} km.`}
              </p>
              {zoneCheck.zone_message ? <p className="mt-1 text-xs opacity-90">{zoneCheck.zone_message}</p> : null}
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-900">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">ETA</p>
                  <p className="text-sm font-bold">{zoneCheck.estimated_eta_minutes || '--'} min</p>
                </div>
                <div className="rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-900">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Distance</p>
                  <p className="text-sm font-bold">{zoneCheck.distance_km} km</p>
                </div>
                <div className="rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-900">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Estimated fee</p>
                  <p className="text-sm font-bold">{formatCurrency(zoneCheck.estimated_delivery_fee)}</p>
                </div>
              </div>
              {!zoneCheck.within_zone ? (
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(`${zoneCheck.restaurant_latitude},${zoneCheck.restaurant_longitude}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-semibold underline"
                >
                  Open restaurant delivery center on map
                </a>
              ) : null}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${zoneCheck.restaurant_latitude},${zoneCheck.restaurant_longitude}`)}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 ml-3 inline-block text-xs font-semibold underline"
              >
                Open restaurant route on Google Maps
              </a>
            </div>
          ) : null}

          {locationMessage ? <p className="text-xs text-neutral-500 dark:text-neutral-400">{locationMessage}</p> : null}
          {restaurantSummary?.delivery_area_label ? (
            <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">
              Delivery available in: {restaurantSummary.delivery_area_label}
            </p>
          ) : null}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Tip: Use area + city (for example: `Bole, Addis Ababa` or `Jugol, Harar`) for better dispatch accuracy.
          </p>
          {zoneError ? <p className="text-sm text-red-600 dark:text-red-300">{zoneError}</p> : null}

          <div>
            <label className="mb-1 block text-sm font-medium">Additional notes (optional)</label>
            <textarea
              {...register('notes')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
              rows={3}
              placeholder="Call on arrival, elevator is on left side"
            />
          </div>

          {submitError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{submitError}</p> : null}

          <button
            type="submit"
            disabled={isSubmittingOrder || isValidatingZone}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            {isSubmittingOrder ? 'Submitting order...' : 'Place order and start payment'}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-lg shadow-orange-100/40 dark:border-neutral-700 dark:bg-neutral-900/95">
          <h3 className="text-lg font-bold">Order total</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Delivery fee</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Discount</span>
              <span className="text-emerald-600 dark:text-emerald-300">-{formatCurrency(discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-base font-bold dark:border-neutral-700">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-neutral-300 p-3 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Validate delivery zone before payment for the most accurate ETA and fee preview.
          </div>
        </aside>
      </div>
    </AppShell>
  );
};

export default CheckoutPage;
