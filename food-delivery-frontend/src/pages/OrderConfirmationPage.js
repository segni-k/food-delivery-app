import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import ChapaPaymentIntegration from '../components/ChapaPaymentIntegration';
import { orderService } from '../services/orderService';
import { useOrderStore } from '../store/orderStore';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

const extractOrderPayment = (order) => {
  if (!order || typeof order !== 'object') {
    return null;
  }

  if (order.latest_payment) {
    return order.latest_payment;
  }

  if (order.payment) {
    return order.payment;
  }

  if (Array.isArray(order.payments) && order.payments.length) {
    return order.payments[0] || null;
  }

  return null;
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [isLoading, setIsLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');
  const didAutoVerifyRef = useRef(false);

  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const setOrderPayment = useOrderStore((state) => state.setOrderPayment);
  const cachedPayment = useOrderStore((state) => state.paymentByOrderId?.[id] || null);
  const isChapaReturn = useMemo(() => new URLSearchParams(location.search).get('from') === 'chapa', [location.search]);
  const orderPayment = extractOrderPayment(order);
  const initialPayment = location.state?.payment || cachedPayment || orderPayment || null;

  useEffect(() => {
    if (location.state?.order) {
      setCurrentOrder(location.state.order);
    }
    if (location.state?.payment) {
      setOrderPayment(id, location.state.payment);
    }
  }, [id, location.state?.order, location.state?.payment, setCurrentOrder, setOrderPayment]);

  useEffect(() => {
    let isActive = true;

    const hydrateOrder = async () => {
      if (location.state?.order) {
        return;
      }
      setIsLoading(true);
      setError('');

      try {
        const fetchedOrder = await orderService.getOrder(id);
        if (!isActive) {
          return;
        }
        setOrder(fetchedOrder);
        setCurrentOrder(fetchedOrder);
        const fetchedPayment = extractOrderPayment(fetchedOrder);
        if (fetchedPayment) {
          setOrderPayment(id, fetchedPayment);
        }
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError?.message || 'Unable to load order confirmation.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    hydrateOrder();

    return () => {
      isActive = false;
    };
  }, [id, location.state?.order, setCurrentOrder]);

  useEffect(() => {
    if (!isChapaReturn || didAutoVerifyRef.current || !initialPayment?.id) {
      return;
    }

    didAutoVerifyRef.current = true;

    const verifyAndRefresh = async () => {
      try {
        const verifiedPayment = await orderService.verifyPayment(initialPayment.id);
        setOrderPayment(id, verifiedPayment);

        const refreshedOrder = await orderService.getOrder(id);
        setOrder(refreshedOrder);
        setCurrentOrder(refreshedOrder);

        const refreshedPayment = extractOrderPayment(refreshedOrder);
        if (refreshedPayment) {
          setOrderPayment(id, refreshedPayment);
        }
      } catch (_error) {
        // Manual verify action remains available in the payment integration card.
      }
    };

    verifyAndRefresh();
  }, [id, initialPayment?.id, isChapaReturn, setCurrentOrder, setOrderPayment]);

  return (
    <AppShell title="Order confirmed" subtitle="Your order has been placed successfully. Complete payment to finalize processing.">
      {isLoading ? <div className="h-36 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" /> : null}

      {!isLoading && error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>
      ) : null}

      {!isLoading && !error && order ? (
        <section className="grid gap-5 rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-300">Order ID</p>
            <p className="mt-1 text-xl font-black">{order.id}</p>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">Status: {order.status}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Delivery to: {order.delivery_address}</p>
            <p className="mt-4 text-lg font-bold">Total: {formatCurrency(order.total_amount)}</p>
          </div>
          <div className="space-y-3">
            <ChapaPaymentIntegration
              orderId={order.id}
              initialPayment={initialPayment}
              pollingEnabled
              pollingIntervalMs={5000}
            />
            <Link
              to={`/orders/${order.id}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Track order
            </Link>
            <Link
              to="/orders"
              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              View order history
            </Link>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
};

export default OrderConfirmationPage;

