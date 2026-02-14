<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendOrderNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly int $orderId)
    {
    }

    public function handle(): void
    {
        Log::info('Order notification job dispatched.', ['order_id' => $this->orderId]);
    }
}
