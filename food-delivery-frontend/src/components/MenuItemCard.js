import React from 'react';
import { Link } from 'react-router-dom';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const MenuItemCard = ({ item, onAddToCart }) => {
  const imageUrl = item.image_url || '';

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          className="mb-3 h-36 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-3 h-36 w-full rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-900 dark:to-orange-900" />
      )}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-bold">
          <Link to={`/menu-items/${item.id}`} className="hover:text-orange-600 dark:hover:text-orange-300">
            {item.name}
          </Link>
        </h3>
        <span className="whitespace-nowrap text-sm font-semibold text-orange-600 dark:text-orange-300">{formatCurrency(item.price)}</span>
      </div>

      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">{item.description || 'No item description available.'}</p>

      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            item.is_available
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
          }`}
        >
          {item.is_available ? 'Available' : 'Unavailable'}
        </span>

        <button
          type="button"
          onClick={() => onAddToCart(item)}
          disabled={!item.is_available}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
};

export default MenuItemCard;
