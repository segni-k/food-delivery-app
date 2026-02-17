import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { orderService } from '../services/orderService';
import { useOrderStore } from '../store/orderStore';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

const OrdersPage = () => {
  const setOrdersInStore = useOrderStore((state) => state.setOrders);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isActive = true;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await orderService.getOrders({ page, per_page: 8 });
        if (!isActive) {
          return;
        }
        setOrders(result.rows || []);
        setOrdersInStore(result.rows || []);
        setMeta(result.meta);
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError?.message || 'Unable to load orders.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      isActive = false;
    };
  }, [page, setOrdersInStore]);

  const lastPage = meta?.last_page || 1;
  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = String(order.id || '');
      const address = order.delivery_address?.toLowerCase() || '';
      const restaurantName = order.restaurant?.name?.toLowerCase() || '';
      const matchesSearch =
        !normalizedSearch ||
        orderId.includes(normalizedSearch) ||
        address.includes(normalizedSearch) ||
        restaurantName.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <AppShell title="Order history" subtitle="Review all previous orders and track their latest statuses.">
      <section className="mb-4 grid gap-3 rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm shadow-orange-100/40 dark:border-neutral-700 dark:bg-neutral-900/90 sm:grid-cols-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order ID, address, or restaurant"
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 sm:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="picked_up">Picked up</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`order-loading-${index}`} className="h-20 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>
      ) : null}

      {!isLoading && !error ? (
        filteredOrders.length ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/95"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Order #{order.id}</p>
                    <p className="text-base font-bold">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/orders/${order.id}`}
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                  >
                    Track order
                  </Link>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{order.delivery_address}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {orders.length ? 'No orders match your current filters.' : 'No orders yet.'}
            </p>
            {!orders.length ? (
              <Link
                to="/restaurants"
                className="mt-3 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Start ordering
              </Link>
            ) : null}
          </div>
        )
      ) : null}

      <footer className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={page <= 1 || isLoading}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
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
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Next
        </button>
      </footer>
    </AppShell>
  );
};

export default OrdersPage;
