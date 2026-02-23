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
        $order = Order::query()
            ->with('customer')
            ->where('public_id', $orderId)
            ->orWhere('id', $orderId)
            ->firstOrFail();
        $this->authorize('view', $order);

        $payment = $this->paymentService->createIntent($order, is_string($returnOrigin) ? $returnOrigin : null);

        return $this->successResponse('Payment intent created.', new PaymentResource($payment));
    }

    public function verify(Payment $payment)
    {
        $verified = $this->paymentService->verify($payment);

        return $this->successResponse('Payment verified.', new PaymentResource($verified));
    }

    public function chapaWebhook(Request $request)
    {
        $this->assertValidWebhookSignature($request);

        $txRef = $this->resolveTxReference($request);
        if ($txRef === '') {
            return response()->json(['status' => 'ignored', 'reason' => 'missing_tx_ref']);
        }

        $payment = Payment::query()->where('gateway_transaction_ref', $txRef)->first();
        if (! $payment) {
            return response()->json(['status' => 'ignored', 'reason' => 'payment_not_found']);
        }

        $this->paymentService->verify($payment);

        return response()->json(['status' => 'ok']);
    }

    public function store(CreatePaymentIntentRequest $request)
    {
        return $this->createIntent($request);
    }

    private function resolveTxReference(Request $request): string
    {
        return trim((string) (
            $request->input('tx_ref')
            ?? $request->input('data.tx_ref')
            ?? $request->input('trx_ref')
            ?? ''
        ));
    }

    private function assertValidWebhookSignature(Request $request): void
    {
        $secret = trim((string) config('services.chapa.webhook_secret'));
        if ($secret === '') {
            return;
        }

        $rawSignature = (string) (
            $request->header('Chapa-Signature')
            ?? $request->header('x-chapa-signature')
            ?? $request->header('x-webhook-signature')
            ?? ''
        );

        $signature = trim(str_ireplace('sha256=', '', $rawSignature));
        if ($signature === '') {
            abort(401, 'Invalid webhook signature.');
        }

        $expected = hash_hmac('sha256', (string) $request->getContent(), $secret);
        if (! hash_equals(strtolower($expected), strtolower($signature))) {
            abort(401, 'Invalid webhook signature.');
        }
    }
}
