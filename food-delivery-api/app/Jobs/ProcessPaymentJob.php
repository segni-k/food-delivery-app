<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPaymentJob implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly int $orderId)
    {
    }

    public function handle(PaymentService $paymentService): void
    {
        $order = Order::query()->with('customer')->find($this->orderId);
        if (! $order) {
            return;
        }

        $paymentService->createIntent($order);
    }
}
