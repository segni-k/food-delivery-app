<?php

namespace Tests\Unit;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\User;
use App\Services\Contracts\PaymentGatewayInterface;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_service_creates_intent_and_verifies(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, fn () => new class implements PaymentGatewayInterface {
            public function createIntent(array $payload): array
            {
                return ['tx_ref' => $payload['tx_ref'], 'raw' => ['status' => 'success']];
            }

            public function verify(string $transactionRef): array
            {
                return ['status' => 'success', 'raw' => ['status' => 'success']];
            }
        });

        $user = User::factory()->create();
        $order = Order::factory()->create(['customer_id' => $user->id]);

        $service = app(PaymentService::class);
        $payment = $service->createIntent($order->load('customer'));
        $verified = $service->verify($payment);

        $this->assertEquals(PaymentStatusEnum::PAID, $verified->status);
    }
}
