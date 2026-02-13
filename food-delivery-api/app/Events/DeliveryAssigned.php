<?php

namespace App\Events;

use App\Models\DeliveryAssignment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryAssigned
{
    use Dispatchable, SerializesModels;

    public function __construct(public DeliveryAssignment $assignment)
    {
    }
}
