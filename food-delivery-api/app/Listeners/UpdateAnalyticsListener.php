<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use App\Jobs\UpdateAnalyticsJob;

class UpdateAnalyticsListener
{
    public function handle(OrderStatusUpdated $event): void
    {
        UpdateAnalyticsJob::dispatch();
    }
}
