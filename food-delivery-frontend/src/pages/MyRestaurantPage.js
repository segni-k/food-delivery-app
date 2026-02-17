import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { ownerService } from '../services/ownerService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

const buildErrorText = (requestError, fallback) => {
  const details = Array.isArray(requestError?.errors) ? requestError.errors.filter(Boolean) : [];
  if (details.length) {
    return `${requestError?.message || fallback} ${details.join(' ')}`;
  }
  return requestError?.message || fallback;
};

const ImageDropzone = ({ id, label, helperText, file, currentImageUrl, onFileChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');

  useEffect(() => {
    if (!(file instanceof File)) {
      setLocalPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleSelectedFiles = (files) => {
    const nextFile = files?.[0] || null;
    if (nextFile && !nextFile.type.startsWith('image/')) {
      return;
    }
    onFileChange(nextFile);
  };

  const previewSrc = localPreviewUrl || currentImageUrl || '';

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleSelectedFiles(event.dataTransfer?.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          isDragging
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
            : 'border-neutral-300 bg-neutral-50 hover:border-orange-400 dark:border-neutral-700 dark:bg-neutral-950/60'
        }`}
      >
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => handleSelectedFiles(event.target.files)}
        />
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Drag and drop or browse to add photo</p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
        {file?.name ? <p className="mt-2 text-xs font-medium text-orange-600 dark:text-orange-300">{file.name}</p> : null}
      </label>
      {previewSrc ? (
        <img
          src={previewSrc}
          alt={label}
          className="h-32 w-full rounded-xl object-cover"
          loading="lazy"
        />
      ) : null}
    </div>
  );
};

const MyRestaurantPage = () => {
  const user = useAuthStore((state) => state.user);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    image: null,
    banner_image: null,
    delivery_radius_km: 5,
    is_active: true,
  });

  const [newCategory, setNewCategory] = useState({ name: '', description: '', sort_order: 0 });
  const [newItem, setNewItem] = useState({
    menu_category_id: '',
    name: '',
    description: '',
    price: '',
    image: null,
    is_available: true,
  });

  const [savingState, setSavingState] = useState({
    restaurant: false,
    category: false,
    item: false,
    order: '',
  });

  const restaurantId = restaurant?.id || null;

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const restaurantsResult = await ownerService.getRestaurants({ per_page: 100 });
      const ownedRestaurant =
        restaurantsResult.rows.find((entry) => entry.owner?.id === user?.id) || restaurantsResult.rows[0] || null;

      if (!ownedRestaurant) {
        setRestaurant(null);
        setCategories([]);
        setItems([]);
        setOrders([]);
        setDeliveryPartners([]);
        return;
      }

      setRestaurant(ownedRestaurant);
      setRestaurantForm({
        name: ownedRestaurant.name || '',
        description: ownedRestaurant.description || '',
        address: ownedRestaurant.address || '',
        image: null,
        banner_image: null,
        delivery_radius_km: ownedRestaurant.delivery_radius_km || 5,
        is_active: Boolean(ownedRestaurant.is_active),
      });

      const [categoriesResult, itemsResult, ordersResult, partnersResult] = await Promise.all([
        ownerService.getCategories(ownedRestaurant.id),
        ownerService.getItems(ownedRestaurant.id, { per_page: 100 }),
        ownerService.getOrders({ per_page: 40 }),
        ownerService.getDeliveryPartners(),
      ]);

      setCategories(categoriesResult || []);
      setItems(itemsResult.rows || []);
      setOrders(ordersResult.rows || []);
      setDeliveryPartners(partnersResult || []);
      setNewItem((prev) => ({
        ...prev,
        menu_category_id: categoriesResult?.[0]?.id || '',
      }));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load owner dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      return;
    }
    loadDashboardData();
  }, [loadDashboardData, user]);

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[category.id] = category.name;
    });
    return map;
  }, [categories]);

  const saveRestaurantInfo = async () => {
    if (!restaurantForm.name.trim() || !restaurantForm.address.trim()) {
      setError('Restaurant name and address are required.');
      return;
    }
    if (Number(restaurantForm.delivery_radius_km) <= 0) {
      setError('Delivery radius must be greater than 0.');
      return;
    }

    setSavingState((prev) => ({ ...prev, restaurant: true }));
    setError('');
    try {
      const payload = { ...restaurantForm };
      const updated = restaurantId
        ? await ownerService.updateRestaurant(restaurantId, payload)
        : await ownerService.createRestaurant(payload);

      setRestaurant(updated);
      setRestaurantForm((prev) => ({
        ...prev,
        address: updated?.address || prev.address,
        image: null,
        banner_image: null,
      }));
      toast.success(restaurantId ? 'Restaurant info saved.' : 'Restaurant created.');
    } catch (requestError) {
      setError(buildErrorText(requestError, 'Unable to save restaurant info.'));
    } finally {
      setSavingState((prev) => ({ ...prev, restaurant: false }));
    }
  };

  const createCategory = async () => {
    if (!restaurantId || !newCategory.name.trim()) {
      return;
    }
    setSavingState((prev) => ({ ...prev, category: true }));
    try {
      await ownerService.createCategory(restaurantId, newCategory);
      setNewCategory({ name: '', description: '', sort_order: 0 });
      const freshCategories = await ownerService.getCategories(restaurantId);
      setCategories(freshCategories);
      setNewItem((prev) => ({
        ...prev,
        menu_category_id: prev.menu_category_id || freshCategories?.[0]?.id || '',
      }));
      toast.success('Category created.');
    } catch (requestError) {
      setError(buildErrorText(requestError, 'Unable to create category.'));
    } finally {
      setSavingState((prev) => ({ ...prev, category: false }));
    }
  };

  const createItem = async () => {
    if (!restaurantId || !newItem.name.trim() || !newItem.menu_category_id) {
      setError('Menu item name and category are required.');
      return;
    }
    if (newItem.price === '' || Number(newItem.price) <= 0) {
      setError('Menu item price must be greater than 0.');
      return;
    }

    setError('');
    setSavingState((prev) => ({ ...prev, item: true }));
    try {
      await ownerService.createItem(restaurantId, {
        ...newItem,
        menu_category_id: String(newItem.menu_category_id),
      });
      setNewItem({
        menu_category_id: categories[0]?.id || '',
        name: '',
        description: '',
        price: '',
        image: null,
        is_available: true,
      });
      const freshItems = await ownerService.getItems(restaurantId, { per_page: 100 });
      setItems(freshItems.rows || []);
      toast.success('Menu item created.');
    } catch (requestError) {
      setError(buildErrorText(requestError, 'Unable to create menu item.'));
    } finally {
      setSavingState((prev) => ({ ...prev, item: false }));
    }
  };

  const toggleItemAvailability = async (itemId, isAvailable) => {
    if (!restaurantId) {
      return;
    }
    try {
      const updated = await ownerService.toggleItemAvailability(restaurantId, itemId, isAvailable);
      setItems((prev) => prev.map((entry) => (entry.id === itemId ? { ...entry, ...updated } : entry)));
      toast.success(`Item marked as ${isAvailable ? 'available' : 'unavailable'}.`);
    } catch (requestError) {
      setError(buildErrorText(requestError, 'Unable to update availability.'));
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setSavingState((prev) => ({ ...prev, order: orderId }));
    try {
      const updated = await ownerService.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, ...updated } : order)));
      toast.success(`Order marked as ${status}.`);
    } catch (requestError) {
      setError(buildErrorText(requestError, 'Unable to update order status.'));
    } finally {
      setSavingState((prev) => ({ ...prev, order: '' }));
    }
  };

  const assignDeliveryPartner = async (orderId, deliveryPartnerId) => {
    if (!deliveryPartnerId) {
      return;
    }
    try {
      const assignment = await ownerService.assignDeliveryPartner(orderId, {
        delivery_partner_id: deliveryPartnerId,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                delivery_assignments: [
                  {
                    id: assignment.assignment_id,
                    status: assignment.status,
                    delivery_partner: {
                      id: assignment.delivery_partner_id,
                      name: assignment.delivery_partner_name,
                    },
                  },
                ],
              }
            : order
        )
      );
      toast.success('Delivery partner assigned.');
    } catch (requestError) {
      setError(buildErrorText(requestError, 'Unable to assign delivery partner.'));
    }
  };

  return (
    <AppShell title="My restaurant" subtitle="Manage your restaurant profile, menu, and order operations from one dashboard.">
      {isLoading ? <div className="h-36 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" /> : null}
      {!isLoading && error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>
      ) : null}

      {!isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95">
            <h2 className="text-lg font-bold">Restaurant info</h2>
            <div className="mt-4 space-y-3">
              <input
                value={restaurantForm.name}
                onChange={(event) => setRestaurantForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Restaurant name"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <textarea
                value={restaurantForm.description}
                onChange={(event) => setRestaurantForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                rows={3}
              />
              <input
                value={restaurantForm.address}
                onChange={(event) => setRestaurantForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Bole, Addis Ababa, Ethiopia"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                We verify this address and map the coordinates automatically.
              </p>
              <ImageDropzone
                id="restaurant-image"
                label="Restaurant photo"
                helperText="PNG, JPG, or WEBP. Select from your device."
                file={restaurantForm.image}
                currentImageUrl={restaurant?.image_url || ''}
                onFileChange={(nextFile) => setRestaurantForm((prev) => ({ ...prev, image: nextFile }))}
              />
              <ImageDropzone
                id="restaurant-banner"
                label="Restaurant banner"
                helperText="PNG, JPG, or WEBP. Wide images work best."
                file={restaurantForm.banner_image}
                currentImageUrl={restaurant?.banner_image_url || ''}
                onFileChange={(nextFile) => setRestaurantForm((prev) => ({ ...prev, banner_image: nextFile }))}
              />
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={restaurantForm.delivery_radius_km}
                onChange={(event) => setRestaurantForm((prev) => ({ ...prev, delivery_radius_km: Number(event.target.value || 0) }))}
                placeholder="Delivery radius km"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={restaurantForm.is_active}
                  onChange={(event) => setRestaurantForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                />
                Restaurant active
              </label>
              <button
                type="button"
                onClick={saveRestaurantInfo}
                disabled={savingState.restaurant}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                {savingState.restaurant ? 'Saving...' : restaurantId ? 'Save restaurant info' : 'Create restaurant'}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95">
            <h2 className="text-lg font-bold">Menu categories</h2>
            <div className="mt-4 grid gap-2">
              <input
                value={newCategory.name}
                onChange={(event) => setNewCategory((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Category name"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={newCategory.description}
                onChange={(event) => setNewCategory((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Category description"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <button
                type="button"
                onClick={createCategory}
                disabled={savingState.category || !restaurantId}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {savingState.category ? 'Creating...' : 'Create category'}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700">
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{category.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95 lg:col-span-2">
            <h2 className="text-lg font-bold">Menu items</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select
                value={newItem.menu_category_id}
                onChange={(event) => setNewItem((prev) => ({ ...prev, menu_category_id: event.target.value }))}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                value={newItem.name}
                onChange={(event) => setNewItem((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Item name"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={newItem.price}
                onChange={(event) => setNewItem((prev) => ({ ...prev, price: event.target.value }))}
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <div className="md:col-span-2">
                <ImageDropzone
                  id="menu-item-image"
                  label="Menu item photo"
                  helperText="Drag and drop or browse to add the menu image."
                  file={newItem.image}
                  currentImageUrl=""
                  onFileChange={(nextFile) => setNewItem((prev) => ({ ...prev, image: nextFile }))}
                />
              </div>
              <textarea
                value={newItem.description}
                onChange={(event) => setNewItem((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Item description"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 md:col-span-2"
                rows={2}
              />
              <button
                type="button"
                onClick={createItem}
                disabled={savingState.item || !restaurantId}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60 md:col-span-2"
              >
                {savingState.item ? 'Creating...' : 'Create menu item'}
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <article key={item.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="mb-3 h-28 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{categoryNameById[item.menu_category_id] || 'Uncategorized'}</p>
                    <p className="mt-1 text-sm">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.is_available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleItemAvailability(item.id, !item.is_available)}
                      className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      Toggle
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95 lg:col-span-2">
            <h2 className="text-lg font-bold">Orders operations</h2>
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{order.delivery_address}</p>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['accepted', 'preparing', 'ready'].map((status) => (
                      <button
                        key={`${order.id}-${status}`}
                        type="button"
                        onClick={() => updateOrderStatus(order.id, status)}
                        disabled={savingState.order === order.id}
                        className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-semibold transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      >
                        Mark {status}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      defaultValue=""
                      onChange={(event) => assignDeliveryPartner(order.id, event.target.value)}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <option value="">Assign delivery partner</option>
                      {deliveryPartners.map((partner) => (
                        <option key={partner.public_id} value={partner.public_id}>
                          {partner.name} ({Number(partner.average_rating || 0).toFixed(1)})
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
};

export default MyRestaurantPage;
