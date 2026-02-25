<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatePaymentIntentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService)
    {
    }

    public function createIntent(CreatePaymentIntentRequest $request)
    {
        $orderId = $request->validated('order_id');
        $returnOrigin = $request->validated('return_origin');
        $forceReinitialize = (bool) $request->validated('force_reinitialize', false);
        $order = Order::query()
            ->with('customer')
            ->where('public_id', $orderId)
            ->orWhere('id', $orderId)
            ->firstOrFail();
        $this->authorize('view', $order);

        $payment = $this->paymentService->createIntent(
            $order,
            is_string($returnOrigin) ? $returnOrigin : null,
            $forceReinitialize
        );

        return $this->successResponse('Payment intent created.', new PaymentResource($payment));
    }

    public function verify(Payment $payment)
    {
        $this->authorize('view', $payment->order);

        $verified = $this->paymentService->verify($payment);

        return $this->successResponse('Payment verified.', new PaymentResource($verified));
    }

    public function chapaWebhook(Request $request)
    {
        $this->assertValidWebhookSignature($request);

        return $this->processChapaNotification($request);
    }

    public function chapaCallback(Request $request)
    {
        return $this->processChapaNotification($request);
    }

    public function store(CreatePaymentIntentRequest $request)
    {
        return $this->createIntent($request);
    }

    private function processChapaNotification(Request $request)
    {
        $txRef = $this->resolveTxReference($request);
        $trRef = $this->resolveGatewayReference($request);
        if ($txRef === '' && $trRef === '') {
            return response()->json(['status' => 'ignored', 'reason' => 'missing_reference']);
        }

        $paymentQuery = Payment::query();

        if ($txRef !== '') {
            $paymentQuery->where('gateway_transaction_ref', $txRef);
        }

        if ($trRef !== '') {
            if ($txRef !== '') {
                $paymentQuery->orWhere('gateway_reference', $trRef);
            } else {
                $paymentQuery->where(function ($query) use ($trRef): void {
                    $query->where('gateway_reference', $trRef)
                        ->orWhere('gateway_transaction_ref', $trRef);
                });
            }
        }

        $payment = $paymentQuery->first();

        if (! $payment) {
            return response()->json(['status' => 'ignored', 'reason' => 'payment_not_found']);
        }

        $this->paymentService->verify($payment);

        return response()->json(['status' => 'ok']);
    }

    private function resolveGatewayReference(Request $request): string
    {
        return trim((string) (
            $request->input('trx_ref')
            ?? $request->input('data.trx_ref')
            ?? $request->input('data.reference')
            ?? $request->input('reference')
            ?? ''
        ));
    }

    private function resolveTxReference(Request $request): string
    {
        return trim((string) (
            $request->input('tx_ref')
            ?? $request->input('data.tx_ref')
            ?? ''
        ));
    }

    private function assertValidWebhookSignature(Request $request): void
    {
        $signatureConfig = config('services.chapa.require_webhook_signature');
        $shouldEnforceSignature = $signatureConfig === null
            ? app()->environment('production')
            : filter_var($signatureConfig, FILTER_VALIDATE_BOOLEAN);
        $secret = trim((string) config('services.chapa.webhook_secret'));

        if ($secret === '') {
            if ($shouldEnforceSignature) {
                abort(422, 'CHAPA_WEBHOOK_SECRET is not configured.');
            }
            return;
        }

        $rawSignature = (string) (
            $request->header('chapa-signature')
            ?? $request->header('Chapa-Signature')
            ?? $request->header('x-chapa-signature')
            ?? $request->header('x-webhook-signature')
            ?? ''
        );

        $signature = trim(str_ireplace('sha256=', '', $rawSignature));
        if ($signature === '') {
            abort(401, 'Invalid webhook signature.');
        }

        $expectedForPayload = hash_hmac('sha256', (string) $request->getContent(), $secret);
        $expectedForSecret = hash_hmac('sha256', $secret, $secret);

        if (! hash_equals(strtolower($expectedForPayload), strtolower($signature))
            && ! hash_equals(strtolower($expectedForSecret), strtolower($signature))) {
            abort(401, 'Invalid webhook signature.');
        }
    }
}
