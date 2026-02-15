import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const rating = Number(restaurant.average_rating || 0);
  const coverImage = restaurant.image_url || restaurant.hero_image_url || '';

  return (
    <article className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-md shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-200/50 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-black/20">
      <div className="relative h-44">
        {coverImage ? (
          <img
            src={coverImage}
            alt={restaurant.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-orange-200 to-rose-300 dark:from-orange-900 dark:to-rose-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 text-white">
          <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            {restaurant.is_active ? 'Open now' : 'Closed'}
          </p>
          <h2 className="mt-4 text-2xl font-bold">{restaurant.name}</h2>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {restaurant.description || 'Popular local spot with fresh dishes and fast delivery.'}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-amber-600 dark:text-amber-300">Rating: {rating.toFixed(1)}</span>
          <span className="text-neutral-500 dark:text-neutral-400">{restaurant.delivery_radius_km} km delivery</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Delivery area: {restaurant.delivery_area || 'Nearby area'}
        </p>

        <Link
          className="inline-flex items-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          to={`/restaurants/${restaurant.id}`}
        >
          Browse menu
        </Link>
      </div>
    </article>
  );
};

export default RestaurantCard;
