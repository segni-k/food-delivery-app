import React from 'react';
import { useCartStore } from '../store/cartStore';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const CartPanel = () => {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const addItem = useCartStore((state) => state.addItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalQuantity = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const subtotal = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-5 shadow-2xl dark:bg-neutral-900">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Your cart</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-neutral-300 px-3 py-1 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Close
          </button>
        </header>

        {items.length ? (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {items.map((item) => (
              <article key={item.lineItemKey} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{formatCurrency(item.price)} each</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.lineItemKey)}
                    className="text-xs font-semibold text-red-600 hover:underline dark:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700">
                    <button type="button" className="px-3 py-1" onClick={() => decrementItem(item.lineItemKey)}>
                      -
                    </button>
                    <span className="px-2 text-sm font-semibold">{item.quantity}</span>
                    <button type="button" className="px-3 py-1" onClick={() => addItem(item)}>
                      +
                    </button>
                  </div>
                  <p className="font-semibold">{formatCurrency(Number(item.price) * item.quantity)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Your cart is empty.
          </div>
        )}

        <footer className="mt-4 space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Items</span>
            <span className="font-semibold">{totalQuantity}</span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-medium">Subtotal</span>
            <span className="font-bold">{formatCurrency(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled={!items.length}
            className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Checkout
          </button>
          {items.length ? (
            <button
              type="button"
              onClick={clearCart}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Clear cart
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
};

export default CartPanel;
