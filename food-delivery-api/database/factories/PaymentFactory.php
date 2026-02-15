<?php

namespace Database\Factories;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'order_id' => Order::factory(),
            'gateway' => 'chapa',
            'gateway_transaction_ref' => 'FD-' . Str::upper(Str::random(20)),
            'gateway_reference' => Str::upper(Str::random(20)),
            'amount' => fake()->randomFloat(2, 20, 200),
            'currency' => 'ETB',
            'status' => PaymentStatusEnum::PENDING,
            'gateway_payload' => null,
        ];
    }
}
