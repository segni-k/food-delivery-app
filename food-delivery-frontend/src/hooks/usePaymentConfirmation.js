import { useCallback, useEffect, useRef, useState } from 'react';
import { orderService } from '../services/orderService';

const terminalStatuses = new Set(['paid', 'failed', 'refunded']);

export const usePaymentConfirmation = ({
  payment,
  orderId,
  enabled = true,
  pollingIntervalMs = 6000,
  websocketEnabled = true,
  onPaymentUpdate,
}) => {
  const wsRef = useRef(null);
  const pollRef = useRef(null);
  const [connectionMode, setConnectionMode] = useState('idle');
  const [error, setError] = useState('');

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const stopWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const verifyPayment = useCallback(async () => {
    if (!payment?.id || !enabled) {
      return null;
    }

    try {
      const verified = await orderService.verifyPayment(payment.id);
      setError('');
      if (verified && typeof onPaymentUpdate === 'function') {
        onPaymentUpdate(verified);
      }
      return verified;
    } catch (requestError) {
      setError(requestError?.message || 'Unable to verify payment.');
      return null;
    }
  }, [enabled, onPaymentUpdate, payment?.id]);

  useEffect(() => {
    if (!enabled || !payment?.id) {
      stopPolling();
      stopWebSocket();
      setConnectionMode('idle');
      return undefined;
    }

    if (terminalStatuses.has(payment.status)) {
      stopPolling();
      stopWebSocket();
      setConnectionMode('settled');
      return undefined;
    }

    const wsBaseUrl = process.env.REACT_APP_PAYMENT_WS_URL;
    const shouldUseWebSocket = websocketEnabled && Boolean(wsBaseUrl);

    if (shouldUseWebSocket) {
      try {
        const wsUrl = `${wsBaseUrl.replace(/\/$/, '')}?order_id=${encodeURIComponent(orderId)}&payment_id=${encodeURIComponent(payment.id)}`;
        wsRef.current = new WebSocket(wsUrl);
        setConnectionMode('websocket');

        wsRef.current.onmessage = () => {
          // Backend real-time stream can push payment updates. We verify against API for source of truth.
          verifyPayment();
        };

        wsRef.current.onerror = () => {
          setConnectionMode('polling');
          stopWebSocket();
        };

        wsRef.current.onclose = () => {
          if (!terminalStatuses.has(payment.status)) {
            setConnectionMode('polling');
          }
        };
      } catch (_error) {
        setConnectionMode('polling');
      }
    } else {
      setConnectionMode('polling');
    }

    if (!pollRef.current) {
      pollRef.current = window.setInterval(() => {
        verifyPayment();
      }, pollingIntervalMs);
    }

    return () => {
      stopPolling();
      stopWebSocket();
    };
  }, [
    enabled,
    orderId,
    payment?.id,
    payment?.status,
    pollingIntervalMs,
    stopPolling,
    stopWebSocket,
    verifyPayment,
    websocketEnabled,
    onPaymentUpdate,
  ]);

  return {
    verifyPayment,
    connectionMode,
    error,
  };
};
