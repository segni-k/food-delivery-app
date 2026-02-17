import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { restaurantService } from '../services/restaurantService';
import { useCartStore } from '../store/cartStore';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const MenuItemDetailPage = () => {
  const { id } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadItem = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await restaurantService.getMenuItemById(id);
        if (!isActive) {
          return;
        }
        setItem(result);
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError?.message || 'Unable to load menu item.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      isActive = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!item?.is_available) {
      return;
    }

    addItem({
      id: item.id,
      restaurant_id: item.restaurant_id,
      name: item.name,
      price: item.price,
      is_available: item.is_available,
    });
  };

  return (
    <AppShell
      title={item?.name || 'Menu item'}
      subtitle={item?.description || 'View menu item details and add to cart.'}
    >
      {isLoading ? <div className="h-64 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" /> : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && item ? (
        <section className="grid gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 lg:grid-cols-2">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-72 w-full rounded-2xl object-cover" loading="lazy" />
          ) : (
            <div className="h-72 w-full rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-900 dark:to-orange-900" />
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              {item.category?.name || 'Menu item'}
            </p>
            <h2 className="mt-2 text-3xl font-black">{item.name}</h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              {item.description || 'No description available for this item.'}
            </p>
            <p className="mt-4 text-2xl font-black text-orange-600 dark:text-orange-300">{formatCurrency(item.price)}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!item.is_available}
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {item.is_available ? 'Add to cart' : 'Unavailable'}
              </button>
              <Link
                to={item.restaurant_id ? `/restaurants/${item.restaurant_id}` : '/restaurants'}
                className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                View restaurant
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
};

export default MenuItemDetailPage;
