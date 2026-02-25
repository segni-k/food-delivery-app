<?php

namespace App\Services;

use App\Enums\PaymentStatusEnum;
use App\Events\PaymentCompleted;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class PaymentService
{
    public function __construct(private readonly PaymentGatewayInterface $gateway)
    {
    }

    public function createIntent(Order $order, ?string $returnOrigin = null, bool $forceReinitialize = false): Payment
    {
        $order->loadMissing(['customer']);

        $payment = $this->resolveExistingPayment($order);
        $createdNewPayment = false;
        if (! $payment) {
            $payment = Payment::query()->create([
                'order_id' => $order->id,
                'gateway' => 'chapa',
                'gateway_transaction_ref' => $this->generateTransactionReference(),
                'amount' => $order->total_amount,
                'currency' => 'ETB',
                'status' => PaymentStatusEnum::PENDING,
            ]);
            $createdNewPayment = true;
        }

        if ($payment->status === PaymentStatusEnum::PAID) {
            return $payment->refresh();
        }

        $shouldReuseCheckout = ! $forceReinitialize && $this->hasReusableCheckoutUrl($payment);
        if ($shouldReuseCheckout) {
            return $payment->refresh();
        }

        if (! $createdNewPayment && $payment->status === PaymentStatusEnum::PENDING) {
            $payment->update([
                'gateway_transaction_ref' => $this->generateTransactionReference(),
                'gateway_reference' => null,
                'gateway_payload' => null,
            ]);
            $payment->refresh();
        }

        $customerEmail = (string) ($order->customer->email ?? '');
        if (! filter_var($customerEmail, FILTER_VALIDATE_EMAIL) || Str::endsWith(Str::lower($customerEmail), '@example.com')) {
            $customerEmail = (string) config('services.chapa.fallback_email');
        }
        $firstName = trim((string) Str::of((string) ($order->customer->name ?? ''))->before(' '));
        if ($firstName === '') {
            $firstName = (string) config('services.chapa.fallback_first_name', 'Customer');
        }

        try {
            $frontendBaseUrl = $this->resolveFrontendBaseUrl($returnOrigin);
            $intent = $this->createGatewayIntentWithTxRefRetry(
                $payment,
                [
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'email' => $customerEmail,
                    'first_name' => $firstName,
                    'callback_url' => $this->resolveCallbackUrl(),
                    'return_url' => $frontendBaseUrl . '/orders/' . $order->public_id . '/confirmation?from=chapa',
                    'customization' => [
                        'title' => 'HarerEats Order',
                        'description' => 'Food delivery checkout',
                    ],
                    'meta' => [
                        'hide_receipt' => false,
                        'order_public_id' => $order->public_id,
                    ],
                ]
            );
        } catch (Throwable $exception) {
            $message = trim((string) $exception->getMessage());
            abort(
                422,
                $message !== ''
                    ? 'Unable to initialize payment. ' . $message
                    : 'Unable to initialize payment right now. Please try again.'
            );
        }

        $payment->update([
            'gateway_reference' => $intent['gateway_reference'] ?? $payment->gateway_reference,
            'gateway_payload' => $intent['raw'] ?? null,
        ]);

        return $payment->refresh();
    }

    private function createGatewayIntentWithTxRefRetry(Payment $payment, array $basePayload): array
    {
        $maxAttempts = 3;
        $lastException = null;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return $this->gateway->createIntent([
                    ...$basePayload,
                    'tx_ref' => $payment->gateway_transaction_ref,
                ]);
            } catch (Throwable $exception) {
                $lastException = $exception;

                if ($attempt < $maxAttempts && $this->isTxRefAlreadyUsedError($exception)) {
                    $payment->update([
                        'gateway_transaction_ref' => $this->generateTransactionReference(),
                    ]);
                    $payment->refresh();
                    continue;
                }

                throw $exception;
            }
        }

        throw $lastException instanceof Throwable
            ? $lastException
            : new RuntimeException('Unable to initialize payment right now. Please try again.');
    }

    private function isTxRefAlreadyUsedError(Throwable $exception): bool
    {
        $message = Str::lower(trim((string) $exception->getMessage()));
        if ($message === '') {
            return false;
        }

        return Str::contains($message, [
            'transaction reference has been used before',
            'tx_ref has been used',
            'reference has been used',
            'duplicate tx_ref',
            'duplicate reference',
        ]);
    }

    private function generateTransactionReference(): string
    {
        return 'FD-' . Str::upper(Str::random(20));
    }

    private function resolveExistingPayment(Order $order): ?Payment
    {
        $latest = Payment::query()
            ->where('order_id', $order->id)
            ->latest()
            ->first();

        if (! $latest) {
            return null;
        }

        if ($latest->status === PaymentStatusEnum::PAID) {
            return $latest;
        }

        if ($latest->status === PaymentStatusEnum::PENDING) {
            return $latest;
        }

        return null;
    }

    private function hasCheckoutUrl(Payment $payment): bool
    {
        $checkoutUrl = data_get($payment->gateway_payload, 'data.checkout_url');

        return is_string($checkoutUrl) && trim($checkoutUrl) !== '';
    }

    private function hasReusableCheckoutUrl(Payment $payment): bool
    {
        if (! $this->hasCheckoutUrl($payment)) {
            return false;
        }

        $ttlMinutes = (int) config('services.chapa.checkout_url_ttl_minutes', 30);
        if ($ttlMinutes <= 0) {
            return true;
        }

        $validAfter = now()->subMinutes($ttlMinutes);
        $referenceTime = $payment->updated_at ?? $payment->created_at;

        return $referenceTime !== null && $referenceTime->greaterThanOrEqualTo($validAfter);
    }

    private function resolveFrontendBaseUrl(?string $returnOrigin): string
    {
        $configured = rtrim((string) config('services.chapa.frontend_url'), '/');

        if (! is_string($returnOrigin) || trim($returnOrigin) === '') {
            return $configured;
        }

        $parsed = parse_url($returnOrigin);
        if (! is_array($parsed)) {
            return $configured;
        }

        $scheme = strtolower((string) ($parsed['scheme'] ?? ''));
        $host = (string) ($parsed['host'] ?? '');
        $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';

        if (! in_array($scheme, ['http', 'https'], true) || $host === '') {
            return $configured;
        }

        return "{$scheme}://{$host}{$port}";
    }

    private function resolveCallbackUrl(): string
    {
        $configured = trim((string) config('services.chapa.callback_url'));
        if ($configured !== '') {
            return $configured;
        }

        return rtrim((string) config('app.url'), '/') . '/api/v1/payments/callback/chapa';
    }

    public function verify(Payment $payment): Payment
    {
        $wasPaid = $payment->status === PaymentStatusEnum::PAID;

        try {
            $verification = $this->gateway->verify($payment->gateway_transaction_ref);
        } catch (Throwable $exception) {
            $message = trim((string) $exception->getMessage());
            abort(
                422,
                $message !== ''
                    ? 'Unable to verify payment. ' . $message
                    : 'Unable to verify payment with gateway right now. Please try again shortly.'
            );
        }

        if (! $this->isVerificationConsistent($payment, $verification)) {
            abort(422, 'Payment verification data mismatch detected. Please contact support.');
        }

        $gatewayStatus = strtolower((string) (
            data_get($verification, 'raw.data.status')
            ?? $verification['status']
            ?? ''
        ));

        $status = match ($gatewayStatus) {
            'success', 'successful', 'succeeded', 'paid', 'completed' => PaymentStatusEnum::PAID,
            'refunded', 'refund' => PaymentStatusEnum::REFUNDED,
            'failed', 'cancelled', 'canceled', 'expired', 'reversed', 'error' => PaymentStatusEnum::FAILED,
            default => PaymentStatusEnum::PENDING,
        };

        $payment->update([
            'status' => $status,
            'paid_at' => $status === PaymentStatusEnum::PAID
                ? ($payment->paid_at ?? now())
                : $payment->paid_at,
            'gateway_reference' => $verification['gateway_reference'] ?? $payment->gateway_reference,
            'gateway_payload' => $verification['raw'] ?? null,
        ]);

        if (! $wasPaid && $status === PaymentStatusEnum::PAID) {
            event(new PaymentCompleted($payment->refresh()));
        }

        return $payment->refresh();
    }

    private function isVerificationConsistent(Payment $payment, array $verification): bool
    {
        $txRef = $this->extractVerifiedTxRef($verification);
        if ($txRef !== null && $txRef !== $payment->gateway_transaction_ref) {
            return false;
        }

        $currency = $this->extractVerifiedCurrency($verification);
        if ($currency !== null && strtoupper($currency) !== strtoupper((string) $payment->currency)) {
            return false;
        }

        $amount = $this->extractVerifiedAmount($verification);
        if ($amount !== null) {
            $localAmount = round((float) $payment->amount, 2);
            if (abs($amount - $localAmount) > 0.01) {
                return false;
            }
        }

        return true;
    }

    private function extractVerifiedTxRef(array $verification): ?string
    {
        $value = data_get($verification, 'raw.data.tx_ref')
            ?? data_get($verification, 'raw.data.transaction_ref')
            ?? data_get($verification, 'raw.data.order_ref')
            ?? null;

        if (! is_scalar($value)) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : null;
    }

    private function extractVerifiedCurrency(array $verification): ?string
    {
        $value = data_get($verification, 'raw.data.currency')
            ?? data_get($verification, 'raw.data.currency_code')
            ?? null;

        if (! is_scalar($value)) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : null;
    }

    private function extractVerifiedAmount(array $verification): ?float
    {
        $value = data_get($verification, 'raw.data.amount')
            ?? data_get($verification, 'raw.data.amount_paid')
            ?? null;

        if (! is_scalar($value) || ! is_numeric((string) $value)) {
            return null;
        }

        return round((float) $value, 2);
    }

    public function refund(Payment $payment, ?string $reason = null): Payment
    {
        if ($payment->status !== PaymentStatusEnum::PAID) {
            abort(422, 'Only paid payments can be refunded.');
        }

        $payload = (array) ($payment->gateway_payload ?? []);
        $payload['refund_reason'] = $reason;
        $payload['refunded_at'] = now()->toIso8601String();

        $payment->update([
            'status' => PaymentStatusEnum::REFUNDED,
            'gateway_payload' => $payload,
        ]);

        return $payment->refresh();
    }
}
