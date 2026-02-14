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
        $order = Order::query()
            ->with('customer')
            ->where('public_id', $orderId)
            ->orWhere('id', $orderId)
            ->firstOrFail();
        $this->authorize('view', $order);

        $payment = $this->paymentService->createIntent($order);

        return $this->successResponse('Payment intent created.', new PaymentResource($payment));
    }

    public function verify(Payment $payment)
    {
        $verified = $this->paymentService->verify($payment);

        return $this->successResponse('Payment verified.', new PaymentResource($verified));
    }

    public function chapaWebhook(Request $request)
    {
        $txRef = (string) $request->input('tx_ref');
        $payment = Payment::query()->where('gateway_transaction_ref', $txRef)->firstOrFail();

        $this->paymentService->verify($payment);

        return response()->json(['status' => 'ok']);
    }

    public function store(CreatePaymentIntentRequest $request)
    {
        return $this->createIntent($request);
    }
}
