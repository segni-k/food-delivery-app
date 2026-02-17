import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { deliveryService } from '../services/deliveryService';
import { toast } from 'react-toastify';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

const mapUrl = (lat, lng) => `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;

const MyDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyOrderId, setBusyOrderId] = useState('');
  const [search, setSearch] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  useEffect(() => {
    let isActive = true;

    const loadDeliveries = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await deliveryService.getMyDeliveries({ page, per_page: 10 });
        if (!isActive) {
          return;
        }
        setDeliveries(result.rows || []);
        setMeta(result.meta);
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError?.message || 'Unable to fetch assigned deliveries.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDeliveries();
    return () => {
      isActive = false;
    };
  }, [page]);

  const updateAssignment = async (orderId, action) => {
    setBusyOrderId(orderId);
    setError('');
    try {
      const result = await deliveryService.respondToAssignment(orderId, action);
      setDeliveries((prev) =>
        prev.map((entry) =>
          entry.order.id === orderId
            ? {
                ...entry,
                assignment_status: result.assignment_status,
              }
            : entry
        )
      );
      toast.success(`Assignment ${action}ed successfully.`);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update assignment.');
    } finally {
      setBusyOrderId('');
    }
  };

  const updateDeliveryProgress = async (orderId, status) => {
    setBusyOrderId(orderId);
    setError('');
    try {
      const result = await deliveryService.updateDeliveryStatus(orderId, status);
      setDeliveries((prev) =>
        prev.map((entry) =>
          entry.order.id === orderId
            ? {
                ...entry,
                assignment_status: result.assignment_status,
                order: {
                  ...entry.order,
                  status: result.order_status,
                },
              }
            : entry
        )
      );
      toast.success(`Delivery marked as ${status.replace('_', ' ')}.`);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update delivery status.');
    } finally {
      setBusyOrderId('');
    }
  };

  const lastPage = meta?.last_page || 1;
  const filteredDeliveries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const restaurantName = delivery.order.restaurant?.name?.toLowerCase() || '';
      const deliveryAddress = delivery.order.delivery_address?.toLowerCase() || '';
      const customerName = delivery.order.customer?.name?.toLowerCase() || '';
      const orderId = String(delivery.order.id || '');
      const matchesSearch =
        !normalizedSearch ||
        restaurantName.includes(normalizedSearch) ||
        deliveryAddress.includes(normalizedSearch) ||
        customerName.includes(normalizedSearch) ||
        orderId.includes(normalizedSearch);

      const matchesAssignment =
        assignmentFilter === 'all' || delivery.assignment_status === assignmentFilter;
      const matchesOrderStatus =
        orderStatusFilter === 'all' || delivery.order.status === orderStatusFilter;

      return matchesSearch && matchesAssignment && matchesOrderStatus;
    });
  }, [assignmentFilter, deliveries, orderStatusFilter, search]);

  return (
    <AppShell title="My deliveries" subtitle="Review assigned deliveries, respond quickly, and update delivery progress in real time.">
      <section className="mb-4 grid gap-3 rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm shadow-orange-100/40 dark:border-neutral-700 dark:bg-neutral-900/90 md:grid-cols-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, customer, address, restaurant"
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 md:col-span-2"
        />
        <select
          value={assignmentFilter}
          onChange={(event) => setAssignmentFilter(event.target.value)}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
        >
          <option value="all">All assignments</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={orderStatusFilter}
          onChange={(event) => setOrderStatusFilter(event.target.value)}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
        >
          <option value="all">All order statuses</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="picked_up">Picked up</option>
          <option value="delivered">Delivered</option>
        </select>
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`delivery-loading-${index}`} className="h-32 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>
      ) : null}

      {!isLoading && !error ? (
        filteredDeliveries.length ? (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <article
                key={delivery.assignment_id}
                className="rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/95"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold">Order #{delivery.order.id}</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Assignment: {delivery.assignment_status}</p>
                  </div>
                  <div className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                    ETA {delivery.estimated_eta_minutes} min
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                    <p className="font-semibold">Pickup</p>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-300">{delivery.order.restaurant.name}</p>
                    <a
                      href={mapUrl(delivery.order.restaurant.latitude, delivery.order.restaurant.longitude)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-orange-600 hover:underline dark:text-orange-300"
                    >
                      Open pickup map
                    </a>
                  </div>
                  <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                    <p className="font-semibold">Drop-off</p>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-300">{delivery.order.delivery_address}</p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Customer: {delivery.order.customer?.name || 'N/A'} {delivery.order.customer?.phone ? `(${delivery.order.customer.phone})` : ''}
                    </p>
                    <a
                      href={mapUrl(delivery.order.delivery_latitude, delivery.order.delivery_longitude)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-orange-600 hover:underline dark:text-orange-300"
                    >
                      Open customer location
                    </a>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-semibold">Order items</p>
                  <ul className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                    {delivery.order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.menu_item?.name || 'Menu item'}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm font-semibold">Total: {formatCurrency(delivery.order.total_amount)}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateAssignment(delivery.order.id, 'accept')}
                    disabled={busyOrderId === delivery.order.id}
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAssignment(delivery.order.id, 'reject')}
                    disabled={busyOrderId === delivery.order.id}
                    className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDeliveryProgress(delivery.order.id, 'picked_up')}
                    disabled={busyOrderId === delivery.order.id}
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    Mark picked up
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDeliveryProgress(delivery.order.id, 'delivered')}
                    disabled={busyOrderId === delivery.order.id}
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    Mark delivered
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {deliveries.length ? 'No deliveries match your filters.' : 'No assigned deliveries yet.'}
            </p>
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

export default MyDeliveriesPage;
