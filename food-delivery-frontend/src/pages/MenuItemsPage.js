import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { ownerService } from '../services/ownerService';
import { restaurantService } from '../services/restaurantService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const MenuItemsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [restaurantId, setRestaurantId] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  useEffect(() => {
    let isActive = true;

    const loadItems = async () => {
      setIsLoading(true);
      setError('');
      try {
        const restaurants = await ownerService.getRestaurants({ per_page: 100 });
        const ownedRestaurant =
          restaurants.rows.find((entry) => entry.owner?.id === user?.id) || restaurants.rows[0] || null;

        if (!ownedRestaurant) {
          setItems([]);
          setRestaurantId('');
          return;
        }

        const currentRestaurantId = ownedRestaurant.id;
        let itemResponse;
        try {
          itemResponse = await ownerService.getItems(currentRestaurantId, { per_page: 200 });
        } catch (_ownerItemsError) {
          // Fallback to public listing endpoint if owner endpoint is temporarily unreachable.
          itemResponse = await restaurantService.getMenuItems({ restaurant_id: currentRestaurantId, per_page: 200 });
        }

        if (!isActive) {
          return;
        }
        setRestaurantId(currentRestaurantId);
        setItems(itemResponse.rows || []);
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError?.message || 'Unable to load menu items.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isActive = false;
    };
  }, [user?.id]);

  const toggleAvailability = async (itemId, isAvailable) => {
    if (!restaurantId) {
      return;
    }
    try {
      const updated = await ownerService.toggleItemAvailability(restaurantId, itemId, isAvailable);
      setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...updated } : item)));
      toast.success(`Item marked as ${isAvailable ? 'available' : 'unavailable'}.`);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update availability.');
    }
  };
  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const name = item.name?.toLowerCase() || '';
      const description = item.description?.toLowerCase() || '';
      const matchesSearch = !normalizedSearch || name.includes(normalizedSearch) || description.includes(normalizedSearch);
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' ? item.is_available : !item.is_available);
      return matchesSearch && matchesAvailability;
    });
  }, [availabilityFilter, items, search]);

  return (
    <AppShell title="Menu items" subtitle="Manage item availability for your restaurant menu.">
      <section className="mb-4 grid gap-3 rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm shadow-orange-100/40 dark:border-neutral-700 dark:bg-neutral-900/90 sm:grid-cols-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search item name or description"
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 sm:col-span-2"
        />
        <select
          value={availabilityFilter}
          onChange={(event) => setAvailabilityFilter(event.target.value)}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
        >
          <option value="all">All availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </section>

      {isLoading ? <div className="h-28 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" /> : null}
      {!isLoading && error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>
      ) : null}
      {!isLoading && !error ? (
        filteredItems.length ? (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h2 className="text-base font-bold">{item.name}</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{item.description || 'No description'}</p>
                <p className="mt-2 text-sm font-semibold">${Number(item.price || 0).toFixed(2)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAvailability(item.id, !item.is_available)}
                    className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    {item.is_available ? 'Set unavailable' : 'Set available'}
                  </button>
                  <Link
                    to={`/menu-items/${item.id}`}
                    className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    View item
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
            No menu items match your filters.
          </section>
        )
      ) : null}
    </AppShell>
  );
};

export default MenuItemsPage;
