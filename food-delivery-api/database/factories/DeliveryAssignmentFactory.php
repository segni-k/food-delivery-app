<?php

namespace Database\Factories;

use App\Enums\DeliveryAssignmentStatusEnum;
use App\Models\DeliveryAssignment;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DeliveryAssignmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'order_id' => Order::factory(),
            'delivery_partner_id' => User::factory(),
            'status' => DeliveryAssignmentStatusEnum::ASSIGNED,
            'estimated_eta_minutes' => 30,
        ];
    }
}
