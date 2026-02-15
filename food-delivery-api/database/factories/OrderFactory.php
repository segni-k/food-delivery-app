<?php

namespace Database\Factories;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 20, 200);

        return [
            'public_id' => (string) Str::uuid(),
            'customer_id' => User::factory(),
            'restaurant_id' => Restaurant::factory(),
            'status' => OrderStatusEnum::PENDING,
            'subtotal_amount' => $subtotal,
            'delivery_fee' => 5,
            'discount_amount' => 0,
            'total_amount' => $subtotal + 5,
            'delivery_latitude' => fake()->latitude(),
            'delivery_longitude' => fake()->longitude(),
            'delivery_address' => fake()->address(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
