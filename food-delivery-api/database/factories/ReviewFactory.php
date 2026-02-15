<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'order_id' => Order::factory(),
            'customer_id' => User::factory(),
            'restaurant_id' => Restaurant::factory(),
            'delivery_partner_id' => User::factory(),
            'restaurant_rating' => fake()->numberBetween(3, 5),
            'delivery_rating' => fake()->numberBetween(3, 5),
            'comment' => fake()->sentence(),
        ];
    }
}
