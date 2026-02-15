<?php

namespace Tests\Feature;

use App\Enums\UserRoleEnum;
use App\Models\Order;
use App\Models\User;
use App\Services\Contracts\PaymentGatewayInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_create_payment_intent(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, fn () => new class implements PaymentGatewayInterface {
            public function createIntent(array $payload): array
            {
                return ['tx_ref' => $payload['tx_ref'], 'checkout_url' => 'https://checkout.test', 'raw' => ['status' => 'success']];
            }

            public function verify(string $transactionRef): array
            {
                return ['status' => 'success', 'raw' => ['status' => 'success']];
            }
        });

        $customer = User::factory()->create(['role' => UserRoleEnum::CUSTOMER]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/payments/intents', [
            'order_id' => $order->id,
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseCount('payments', 1);
    }
}
