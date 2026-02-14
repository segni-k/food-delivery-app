<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Jobs\AssignDeliveryPartnerJob;

class AssignDeliveryPartnerListener
{
    public function handle(OrderCreated $event): void
    {
        AssignDeliveryPartnerJob::dispatch($event->order->id);
    }
}
