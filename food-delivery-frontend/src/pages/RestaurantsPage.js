import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantService } from '../services/restaurantService';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await restaurantService.getRestaurants({ page, per_page: 9 });
        if (!isActive) {
          return;
        }

        setRestaurants(result.rows || []);
        setMeta(result.meta);
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError?.message || 'Unable to load restaurants.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchRestaurants();

    return () => {
      isActive = false;
    };
  }, [page]);

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesSearch =
        normalizedSearch === '' ||
        restaurant.name?.toLowerCase().includes(normalizedSearch) ||
        restaurant.description?.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'open' ? restaurant.is_active : !restaurant.is_active);
      const rating = Number(restaurant.average_rating || 0);
      const matchesRating =
        ratingFilter === 'all' ||
        (ratingFilter === '4plus' ? rating >= 4 : ratingFilter === '3plus' ? rating >= 3 : true);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [restaurants, search, statusFilter, ratingFilter]);

  const lastPage = meta?.last_page || 1;

  return (
    <AppShell
      title="Discover top restaurants"
      subtitle="Explore local favorites with polished ordering workflows and real-time availability."
    >
      <section className="mb-6 rounded-3xl bg-[linear-gradient(135deg,#f97316_0%,#ef4444_50%,#111827_100%)] p-5 text-white shadow-xl sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">Curated For You</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Fast delivery, standout menus, better checkout.</h2>
        <p className="mt-2 max-w-2xl text-sm text-orange-50/95">
          Browse trending kitchens, compare ratings, and build your cart in seconds.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/cart" className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30">
            Open cart
          </Link>
          <Link to="/orders" className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30">
            Track orders
          </Link>
        </div>
      </section>

      <section className="mb-6 grid gap-3 rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-md shadow-orange-100/40 dark:border-neutral-700 dark:bg-neutral-900/90 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search restaurant or cuisine"
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
        >
          <option value="all">All status</option>
          <option value="open">Open now</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(event) => setRatingFilter(event.target.value)}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
        >
          <option value="all">All ratings</option>
          <option value="4plus">4.0 and above</option>
          <option value="3plus">3.0 and above</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setRatingFilter('all');
          }}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Reset filters
        </button>
      </section>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`restaurant-loading-${index}`}
              className="h-72 animate-pulse rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        filteredRestaurants.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
            No restaurants match the current filters.
          </div>
        )
      ) : null}

      <footer className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={page <= 1 || isLoading}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Previous
        </button>
        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          Page {page} of {lastPage}
        </p>
        <button
          type="button"
          disabled={page >= lastPage || isLoading}
          onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Next
        </button>
      </footer>
    </AppShell>
  );
};

export default RestaurantsPage;
