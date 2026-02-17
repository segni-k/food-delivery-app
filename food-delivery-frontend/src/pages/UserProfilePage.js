import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { profileService } from '../services/profileService';
import { locationService } from '../services/locationService';

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [addressForm, setAddressForm] = useState({ label: '', address_line: '', is_default: true });
  const [cardForm, setCardForm] = useState({ cardholder_name: '', brand: '', last4: '', exp_month: '', exp_year: '', is_default: true });

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await profileService.getProfile();
      setProfile(result);
      setForm({
        name: result?.name || '',
        phone: result?.phone || '',
      });
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    setError('');
    try {
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update profile.');
    }
  };

  const addAddress = async () => {
    if (!addressForm.address_line.trim()) {
      return;
    }

    setError('');
    try {
      const geocoded = await locationService.geocodeAddress(addressForm.address_line);
      await profileService.addAddress({
        ...addressForm,
        address_line: geocoded.normalizedAddress,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
      });
      setAddressForm({ label: '', address_line: '', is_default: false });
      await loadProfile();
    } catch (requestError) {
      setError(requestError?.message || 'Unable to add address.');
    }
  };

  const deleteAddress = async (addressId) => {
    setError('');
    try {
      await profileService.deleteAddress(addressId);
      await loadProfile();
    } catch (requestError) {
      setError(requestError?.message || 'Unable to remove address.');
    }
  };

  const addCard = async () => {
    if (!cardForm.cardholder_name || !cardForm.last4 || !cardForm.exp_month || !cardForm.exp_year) {
      return;
    }

    setError('');
    try {
      await profileService.addPaymentCard({
        ...cardForm,
        exp_month: Number(cardForm.exp_month),
        exp_year: Number(cardForm.exp_year),
      });
      setCardForm({ cardholder_name: '', brand: '', last4: '', exp_month: '', exp_year: '', is_default: false });
      await loadProfile();
    } catch (requestError) {
      setError(requestError?.message || 'Unable to add payment card.');
    }
  };

  const deleteCard = async (cardId) => {
    setError('');
    try {
      await profileService.deletePaymentCard(cardId);
      await loadProfile();
    } catch (requestError) {
      setError(requestError?.message || 'Unable to remove payment card.');
    }
  };

  return (
    <AppShell title="My profile" subtitle="Manage your personal details, saved addresses, and payment cards.">
      {isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" /> : null}
      {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p> : null}

      {!isLoading && profile ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95">
            <h2 className="text-lg font-bold">Profile details</h2>
            <div className="mt-4 space-y-3">
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Full name"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Phone number"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <button
                type="button"
                onClick={saveProfile}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
              >
                Save profile
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95">
            <h2 className="text-lg font-bold">Saved addresses</h2>
            <div className="mt-3 space-y-2">
              {(profile.addresses || []).map((address) => (
                <div key={address.id} className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                  <p className="font-semibold">{address.label || 'Address'}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{address.address_line}</p>
                  <button type="button" onClick={() => deleteAddress(address.id)} className="mt-2 text-xs font-semibold text-red-600">Remove</button>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <input
                value={addressForm.label}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="Label (Home, Office)"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={addressForm.address_line}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, address_line: event.target.value }))}
                placeholder="Bole, Addis Ababa, Ethiopia"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <button type="button" onClick={addAddress} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white">Add address</button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white/95 p-5 dark:border-neutral-700 dark:bg-neutral-900/95 lg:col-span-2">
            <h2 className="text-lg font-bold">Payment cards</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(profile.payment_cards || []).map((card) => (
                <div key={card.id} className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                  <p className="font-semibold">{card.brand || 'Card'} **** {card.last4}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Exp {card.exp_month}/{card.exp_year}</p>
                  <button type="button" onClick={() => deleteCard(card.id)} className="mt-2 text-xs font-semibold text-red-600">Remove</button>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <input
                value={cardForm.cardholder_name}
                onChange={(event) => setCardForm((prev) => ({ ...prev, cardholder_name: event.target.value }))}
                placeholder="Cardholder name"
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={cardForm.brand}
                onChange={(event) => setCardForm((prev) => ({ ...prev, brand: event.target.value }))}
                placeholder="Brand (Visa, MasterCard)"
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={cardForm.last4}
                onChange={(event) => setCardForm((prev) => ({ ...prev, last4: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="Last 4 digits"
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={cardForm.exp_month}
                onChange={(event) => setCardForm((prev) => ({ ...prev, exp_month: event.target.value.replace(/\D/g, '').slice(0, 2) }))}
                placeholder="Exp month"
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={cardForm.exp_year}
                onChange={(event) => setCardForm((prev) => ({ ...prev, exp_year: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="Exp year"
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              <button type="button" onClick={addCard} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white">Add card</button>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
};

export default UserProfilePage;
