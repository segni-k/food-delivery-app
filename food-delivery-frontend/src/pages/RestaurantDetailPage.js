import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import MenuItemCard from '../components/MenuItemCard';
import { restaurantService } from '../services/restaurantService';
import { orderService } from '../services/orderService';
import { locationService } from '../services/locationService';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const locationLatitude = useLocationStore((state) => state.latitude);
  const locationLongitude = useLocationStore((state) => state.longitude);
  const setLocation = useLocationStore((state) => state.setLocation);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoneValidation, setZoneValidation] = useState(null);
  const [zoneError, setZoneError] = useState('');
  const [isCheckingZone, setIsCheckingZone] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchRestaurantData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [restaurantResult, menuItemsResult] = await Promise.all([
          restaurantService.getRestaurantById(id),
          restaurantService.getMenuItems({ restaurant_id: id, per_page: 120 }),
        ]);

        if (!isActive) {
          return;
        }

        setRestaurant(restaurantResult);
        setMenuItems(menuItemsResult.rows || []);
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError?.message || 'Unable to load restaurant details.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchRestaurantData();

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    let isActive = true;

    const ensureLocation = async () => {
      if (locationLatitude && locationLongitude) {
        return;
      }

      try {
        const detected = await locationService.detectBrowserLocation();
        const detectedAddress = await locationService.reverseGeocode(detected.latitude, detected.longitude);
        if (!isActive) {
          return;
        }
        setLocation({
          address: detectedAddress,
          latitude: detected.latitude,
          longitude: detected.longitude,
          source: 'auto',
        });
      } catch (_error) {
        if (!isActive) {
          return;
        }
        setLocationError('Location not detected automatically. You can continue and enter your address at checkout.');
      }
    };

    ensureLocation();

    return () => {
      isActive = false;
    };
  }, [locationLatitude, locationLongitude, setLocation]);

  useEffect(() => {
    let isActive = true;

    const validateZone = async () => {
      if (!locationLatitude || !locationLongitude || !id) {
        return;
      }

      setIsCheckingZone(true);
      setZoneError('');

      try {
        const result = await orderService.validateDeliveryZone({
          restaurant_id: id,
          delivery_latitude: locationLatitude,
          delivery_longitude: locationLongitude,
        });
        if (!isActive) {
          return;
        }
        setZoneValidation(result);
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setZoneValidation(null);
        setZoneError(requestError?.message || 'Unable to validate delivery zone yet.');
      } finally {
        if (isActive) {
          setIsCheckingZone(false);
        }
      }
    };

    validateZone();

    return () => {
      isActive = false;
    };
  }, [id, locationLatitude, locationLongitude]);

  const groupedItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const buckets = {};

    menuItems
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          item.name?.toLowerCase().includes(normalizedSearch) ||
          item.description?.toLowerCase().includes(normalizedSearch)
        );
      })
      .forEach((item) => {
        const categoryName = item.category?.name || 'Chef Specials';
        if (!buckets[categoryName]) {
          buckets[categoryName] = [];
        }
        buckets[categoryName].push(item);
      });

    return buckets;
  }, [menuItems, search]);

  const addMenuItemToCart = (item) => {
    addItem({
      id: item.id,
      restaurant_id: item.restaurant_id || id,
      name: item.name,
      price: item.price,
      is_available: item.is_available,
    });
  };

  return (
    <AppShell
      title={restaurant?.name || 'Restaurant menu'}
      subtitle={restaurant?.description || 'Browse categories, discover bestsellers, and add items to cart quickly.'}
    >
      {restaurant ? (
        <section className="relative mb-5 overflow-hidden rounded-2xl border border-orange-100 dark:border-neutral-700">
          {restaurant.image_url || restaurant.hero_image_url ? (
            <img
              src={restaurant.image_url || restaurant.hero_image_url}
              alt={restaurant.name}
              className="h-52 w-full object-cover sm:h-64"
              loading="lazy"
            />
          ) : (
            <div className="h-52 w-full bg-gradient-to-br from-orange-200 to-rose-300 sm:h-64 dark:from-orange-900 dark:to-rose-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 text-white">
            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              {restaurant.delivery_area_label || 'Delivery ready'}
            </p>
          </div>
        </section>
      ) : null}

      <section className="mb-5 flex flex-wrap items-center gap-3">
        <Link
          to="/restaurants"
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Back to restaurants
        </Link>
        <Link
          to="/cart"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Go to cart
        </Link>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          type="text"
          placeholder="Search menu items"
          className="w-full max-w-md rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        {restaurant ? (
          <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            Avg rating: {Number(restaurant.average_rating || 0).toFixed(1)}
          </span>
        ) : null}
        {restaurant?.delivery_area_label ? (
          <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
            Delivery area: {restaurant.delivery_area_label}
          </span>
        ) : null}
        {isCheckingZone ? <span className="text-xs text-neutral-500 dark:text-neutral-400">Checking delivery zone...</span> : null}
        {!isCheckingZone && zoneValidation ? (
          <div
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${
              zoneValidation.within_zone
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            <p>
              {zoneValidation.within_zone
                ? `Deliverable to your location near ${zoneValidation.zone_name} (${zoneValidation.distance_km} km)`
                : `This restaurant serves around ${zoneValidation.zone_name}. You are ${zoneValidation.distance_km} km away, while max delivery is ${zoneValidation.max_radius_km} km.`}
            </p>
            {zoneValidation.zone_message ? <p className="mt-1 opacity-90">{zoneValidation.zone_message}</p> : null}
            {!zoneValidation.within_zone ? (
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(`${zoneValidation.restaurant_latitude},${zoneValidation.restaurant_longitude}`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block underline"
              >
                Open restaurant delivery center on map
              </a>
            ) : null}
          </div>
        ) : null}
      </section>
      {locationError ? <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">{locationError}</p> : null}
      {zoneError ? <p className="mb-4 text-sm text-red-600 dark:text-red-300">{zoneError}</p> : null}

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-24 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-24 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        Object.keys(groupedItems).length ? (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([categoryName, items]) => (
              <section key={categoryName} className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/90">
                <h2 className="mb-3 text-xl font-bold">{categoryName}</h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} onAddToCart={addMenuItemToCart} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
            No menu items found for this search.
          </div>
        )
      ) : null}
    </AppShell>
  );
};

export default RestaurantDetailPage;
