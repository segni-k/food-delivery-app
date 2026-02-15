<?php

namespace Database\Factories;

use App\Enums\PromoCodeTypeEnum;
use App\Models\PromoCode;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PromoCodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'code' => strtoupper(fake()->bothify('PROMO-####')),
            'type' => fake()->randomElement(PromoCodeTypeEnum::values()),
            'value' => fake()->randomFloat(2, 5, 30),
            'minimum_order_amount' => fake()->randomFloat(2, 0, 100),
            'usage_limit' => fake()->numberBetween(20, 100),
            'used_count' => 0,
            'expires_at' => now()->addMonth(),
            'is_active' => true,
        ];
    }
}
