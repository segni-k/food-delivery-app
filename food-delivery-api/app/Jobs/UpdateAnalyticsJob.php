<?php

namespace App\Jobs;

use App\Services\AnalyticsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UpdateAnalyticsJob implements ShouldQueue
{
    use Queueable;

    public function handle(AnalyticsService $analyticsService): void
    {
        $analyticsService->updateOrderAnalytics();
    }
}
