<?php

namespace App\Services;

use App\Enums\PaymentStatusEnum;
use App\Events\PaymentCompleted;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Str;
use Throwable;

class PaymentService
{
    public function __construct(private readonly PaymentGatewayInterface $gateway)
    {
    }

    public function createIntent(Order $order, ?string $returnOrigin = null): Payment
    {
        $payment = Payment::query()->create([
            'order_id' => $order->id,
            'gateway' => 'chapa',
            'gateway_transaction_ref' => 'FD-' . Str::upper(Str::random(20)),
            'amount' => $order->total_amount,
            'currency' => 'ETB',
            'status' => PaymentStatusEnum::PENDING,
        ]);

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
            $intent = $this->gateway->createIntent([
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'email' => $customerEmail,
                'first_name' => $firstName,
                'tx_ref' => $payment->gateway_transaction_ref,
                'callback_url' => config('app.url') . '/api/v1/payments/webhook/chapa',
                'return_url' => $frontendBaseUrl . '/orders/' . $order->public_id . '/confirmation?from=chapa',
                'customization' => [
                    'title' => 'HarerEats Order',
                ],
            ]);
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
            'gateway_reference' => $intent['tx_ref'] ?? $payment->gateway_transaction_ref,
            'gateway_payload' => $intent['raw'] ?? null,
        ]);

        return $payment->refresh();
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
            'gateway_payload' => $verification['raw'] ?? null,
        ]);

        if (! $wasPaid && $status === PaymentStatusEnum::PAID) {
            event(new PaymentCompleted($payment->refresh()));
        }

        return $payment->refresh();
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
