<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\DeliveryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AssignDeliveryPartnerJob implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly int $orderId)
    {
    }

    public function handle(DeliveryService $deliveryService): void
    {
        $order = Order::query()->with('restaurant')->find($this->orderId);
        if (! $order) {
            return;
        }

        $deliveryService->assignNearestPartner($order);
    }
}
