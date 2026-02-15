import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePaymentConfirmation } from '../hooks/usePaymentConfirmation';
import { orderService } from '../services/orderService';
import { useOrderStore } from '../store/orderStore';
import { toast } from 'react-toastify';

const statusThemeMap = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  failed: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  refunded: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  pending: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

const statusMessage = {
  paid: 'Payment successful.',
  failed: 'Payment failed. Please retry.',
  refunded: 'Payment refunded.',
  pending: 'Payment pending confirmation.',
};

const getPaymentSyncKey = (payment) =>
  payment
    ? `${payment.id || ''}|${payment.status || ''}|${payment.checkout_url || ''}|${payment.gateway_transaction_ref || ''}`
    : 'none';

const ChapaPaymentIntegration = ({
  orderId,
  initialPayment = null,
  pollingEnabled = true,
  pollingIntervalMs = 6000,
  websocketEnabled = true,
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [manualError, setManualError] = useState('');
  const [localPayment, setLocalPayment] = useState(initialPayment);
  const [initialSyncKey, setInitialSyncKey] = useState('');

  const setOrderPayment = useOrderStore((state) => state.setOrderPayment);
  const getOrderPayment = useOrderStore((state) => state.getOrderPayment);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const setPaymentNotification = useOrderStore((state) => state.setPaymentNotification);
  const paymentNotification = useOrderStore((state) => state.paymentNotificationByOrderId?.[orderId] || null);

  const payment = localPayment || getOrderPayment(orderId);
  const currentStatus = payment?.status || 'pending';
  const themeClass = statusThemeMap[currentStatus] || statusThemeMap.pending;
  const notificationText = paymentNotification?.message || statusMessage[currentStatus] || 'Payment state updated.';

  const upsertPaymentState = useCallback((nextPayment) => {
    if (!nextPayment) {
      return;
    }
    setLocalPayment(nextPayment);
    setOrderPayment(orderId, nextPayment);
    setPaymentNotification(orderId, {
      status: nextPayment.status || 'pending',
      message: statusMessage[nextPayment.status] || 'Payment state updated.',
      timestamp: Date.now(),
    });
  }, [orderId, setOrderPayment, setPaymentNotification]);

  const verifyPayment = useCallback(async () => {
    if (!payment?.id) {
      return;
    }

    setIsVerifying(true);
    setManualError('');
    try {
      const verifiedPayment = await orderService.verifyPayment(payment.id);
      upsertPaymentState(verifiedPayment);

      if (verifiedPayment?.status === 'paid') {
        const updatedOrder = await orderService.getOrder(orderId);
        setCurrentOrder(updatedOrder);
        toast.success('Payment confirmed for this order.');
      }
    } catch (requestError) {
      setManualError(requestError?.message || 'Unable to verify payment status.');
      toast.error(requestError?.message || 'Unable to verify payment status.');
    } finally {
      setIsVerifying(false);
    }
  }, [orderId, payment?.id, setCurrentOrder, upsertPaymentState]);

  const initializePayment = useCallback(async () => {
    setIsInitializing(true);
    setManualError('');
    try {
      const createdPayment = await orderService.createPayment({
        order_id: orderId,
        return_origin: window.location.origin,
      });
      upsertPaymentState(createdPayment);
      if (createdPayment?.checkout_url) {
        window.location.assign(createdPayment.checkout_url);
        toast.success('Payment session created. Continue in Chapa checkout.');
      }
    } catch (requestError) {
      setManualError(requestError?.message || 'Unable to initialize payment.');
      toast.error(requestError?.message || 'Unable to initialize payment.');
    } finally {
      setIsInitializing(false);
    }
  }, [orderId, upsertPaymentState]);

  const openCheckout = useCallback(() => {
    if (!payment?.checkout_url) {
      return;
    }

    window.location.assign(payment.checkout_url);
  }, [payment?.checkout_url]);

  useEffect(() => {
    if (initialPayment) {
      const nextKey = getPaymentSyncKey(initialPayment);
      if (nextKey !== initialSyncKey) {
        upsertPaymentState(initialPayment);
        setInitialSyncKey(nextKey);
      }
    }
  }, [initialPayment, initialSyncKey, upsertPaymentState]);

  const handleAutoPaymentUpdate = useCallback(async (nextPayment) => {
      upsertPaymentState(nextPayment);
      if (nextPayment?.status === 'paid') {
        const updatedOrder = await orderService.getOrder(orderId);
        setCurrentOrder(updatedOrder);
        toast.success('Payment successful.');
      }
  }, [orderId, setCurrentOrder, upsertPaymentState]);

  const { connectionMode, error: autoError } = usePaymentConfirmation({
    payment,
    orderId,
    enabled: pollingEnabled,
    pollingIntervalMs,
    websocketEnabled,
    onPaymentUpdate: handleAutoPaymentUpdate,
  });

  const readableStatus = useMemo(
    () =>
      String(currentStatus || 'pending')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    [currentStatus]
  );

  return (
    <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white/95 p-4 dark:border-neutral-700 dark:bg-neutral-900/95">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold">Chapa payment</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${themeClass}`}>{readableStatus}</span>
      </div>

      {payment?.gateway_transaction_ref ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Transaction ref: {payment.gateway_transaction_ref}</p>
      ) : null}
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Confirmation mode: {connectionMode}</p>

      <p className={`rounded-xl px-3 py-2 text-sm ${themeClass}`}>{notificationText}</p>
      {manualError || autoError ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{manualError || autoError}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={initializePayment}
          disabled={isInitializing}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isInitializing ? 'Initializing...' : payment ? 'Re-init payment' : 'Initialize payment'}
        </button>
        <button
          type="button"
          onClick={openCheckout}
          disabled={!payment?.checkout_url}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Open checkout
        </button>
        <button
          type="button"
          onClick={verifyPayment}
          disabled={!payment?.id || isVerifying}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          {isVerifying ? 'Checking...' : 'Check status'}
        </button>
      </div>
    </section>
  );
};

export default ChapaPaymentIntegration;
