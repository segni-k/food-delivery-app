import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useCartStore } from '../store/cartStore';
import { orderService } from '../services/orderService';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const CartPage = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const promo = useCartStore((state) => state.promo);
  const addItem = useCartStore((state) => state.addItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setPromo = useCartStore((state) => state.setPromo);
  const clearPromo = useCartStore((state) => state.clearPromo);
  const clearCart = useCartStore((state) => state.clearCart);

  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [items]
  );
  const discount = Number(promo?.discount_amount || 0);
  const total = Math.max(subtotal - discount, 0);

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Enter a promo code first.');
      setPromoMessage('');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');
    setPromoMessage('');

    try {
      const result = await orderService.validatePromoCode({
        code: promoCode.trim().toUpperCase(),
        subtotal,
      });
      setPromo({
        code: promoCode.trim().toUpperCase(),
        discount_amount: Number(result?.discount_amount || 0),
        meta: result?.promo || null,
      });
      setPromoMessage('Promo code applied.');
    } catch (error) {
      setPromo(null);
      setPromoError(error?.message || 'Promo validation failed.');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  return (
    <AppShell title="Your cart" subtitle="Review items, apply promo codes, and continue to secure checkout.">
      {items.length ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="space-y-3 lg:col-span-2">
            {items.map((item) => (
              <article
                key={item.lineItemKey}
                className="rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/95"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold">{item.name}</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{formatCurrency(item.price)} each</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.lineItemKey)}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20"
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
                  <p className="font-bold">{formatCurrency(Number(item.price) * item.quantity)}</p>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-lg shadow-orange-100/40 dark:border-neutral-700 dark:bg-neutral-900/95">
            <h3 className="text-lg font-bold">Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Discount</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-300">-{formatCurrency(discount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-base dark:border-neutral-700">
                <span className="font-bold">Total</span>
                <span className="font-black">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Promo code</label>
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder="SAVE20"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={isApplyingPromo}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Apply
                </button>
              </div>
              {promo ? (
                <button
                  type="button"
                  onClick={() => {
                    clearPromo();
                    setPromoCode('');
                    setPromoMessage('');
                  }}
                  className="text-xs font-semibold text-neutral-500 hover:underline dark:text-neutral-300"
                >
                  Remove promo
                </button>
              ) : null}
              {promoError ? <p className="text-xs text-red-600 dark:text-red-300">{promoError}</p> : null}
              {promoMessage ? <p className="text-xs text-emerald-600 dark:text-emerald-300">{promoMessage}</p> : null}
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-5 w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Proceed to checkout
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Clear cart
            </button>
          </aside>
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Add dishes from a restaurant to begin checkout.</p>
          <Link
            className="mt-4 inline-flex rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            to="/restaurants"
          >
            Browse restaurants
          </Link>
        </section>
      )}
    </AppShell>
  );
};

export default CartPage;

