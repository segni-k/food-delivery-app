<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Jobs\ProcessPaymentJob;

class ProcessPaymentListener
{
    public function handle(OrderCreated $event): void
    {
        ProcessPaymentJob::dispatch($event->order->id);
    }
}
