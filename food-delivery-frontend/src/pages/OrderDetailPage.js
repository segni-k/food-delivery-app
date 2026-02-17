import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import OrderTimeline from '../components/OrderTimeline';
import ChapaPaymentIntegration from '../components/ChapaPaymentIntegration';
import OrderReviewForm from '../components/OrderReviewForm';
import { orderService } from '../services/orderService';
import { useOrderStore } from '../store/orderStore';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

const OrderDetailPage = () => {
  const { id } = useParams();
  const cachedOrder = useOrderStore((state) => state.orders.find((entry) => entry.id === id) || null);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const cachedPayment = useOrderStore((state) => state.paymentByOrderId?.[id] || null);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchOrder = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await orderService.getOrder(id);
        if (!isActive) {
          return;
        }
        setOrder(result);
        setCurrentOrder(result);
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError?.message || 'Unable to load order.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();
    return () => {
      isActive = false;
    };
  }, [id, setCurrentOrder]);

  useEffect(() => {
    if (cachedOrder && !order) {
      setOrder(cachedOrder);
      setIsLoading(false);
    }
  }, [cachedOrder, order]);

  return (
    <AppShell title="Order tracking" subtitle="Track your order timeline from pending to delivered.">
      {isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" /> : null}

      {!isLoading && error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>
      ) : null}

      {!isLoading && !error && order ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-black">Order {order.id}</h2>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                {order.status}
              </span>
            </div>
            <OrderTimeline timeline={order.status_timeline} currentStatus={order.status} />
          </section>

          <aside className="h-fit rounded-2xl border border-orange-100 bg-white/95 p-5 shadow-md shadow-orange-100/40 dark:border-neutral-700 dark:bg-neutral-900/95">
            <h3 className="text-lg font-bold">Order summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                <span>{formatCurrency(order.subtotal_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Delivery fee</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 pt-2 font-bold dark:border-neutral-700">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">Address: {order.delivery_address}</p>
            <div className="mt-4">
              <ChapaPaymentIntegration
                orderId={order.id}
                initialPayment={cachedPayment}
                pollingEnabled
                pollingIntervalMs={7000}
              />
            </div>
            <div className="mt-4">
              {order.review ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900/30 dark:bg-emerald-900/20">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">Review submitted</p>
                  <p className="mt-1 text-emerald-700/90 dark:text-emerald-300/90">
                    Restaurant: {order.review.restaurant_rating}/5, Delivery: {order.review.delivery_rating || '-'}/5
                  </p>
                  {order.review.comment ? <p className="mt-1 text-emerald-700/90 dark:text-emerald-300/90">{order.review.comment}</p> : null}
                </div>
              ) : null}

              {order.status === 'delivered' && !order.review ? (
                <OrderReviewForm
                  orderId={order.id}
                  onSubmitted={(review) => {
                    const nextOrder = { ...order, review };
                    setOrder(nextOrder);
                    setCurrentOrder(nextOrder);
                  }}
                />
              ) : null}
            </div>
            <Link
              to="/orders"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Back to order history
            </Link>
          </aside>
        </div>
      ) : null}
    </AppShell>
  );
};

export default OrderDetailPage;
