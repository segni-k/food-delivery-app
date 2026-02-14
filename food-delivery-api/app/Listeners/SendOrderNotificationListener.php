<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Jobs\SendOrderNotificationJob;

class SendOrderNotificationListener
{
    public function handle(OrderCreated $event): void
    {
        SendOrderNotificationJob::dispatch($event->order->id);
    }
}
