<?php

namespace Tests\Feature;

use App\Enums\UserRoleEnum;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\Contracts\PaymentGatewayInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use RuntimeException;
use Tests\TestCase;

class PaymentFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function bindFakeGateway(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, fn () => new class implements PaymentGatewayInterface {
            public function createIntent(array $payload): array
            {
                return [
                    'tx_ref' => $payload['tx_ref'],
                    'checkout_url' => 'https://checkout.test/' . $payload['tx_ref'],
                    'raw' => [
                        'status' => 'success',
                        'data' => [
                            'checkout_url' => 'https://checkout.test/' . $payload['tx_ref'],
                        ],
                    ],
                ];
            }

            public function verify(string $transactionRef): array
            {
                return [
                    'status' => 'success',
                    'raw' => [
                        'status' => 'success',
                        'data' => [
                            'status' => 'success',
                        ],
                    ],
                ];
            }
        });
    }

    public function test_customer_can_create_payment_intent(): void
    {
        $this->bindFakeGateway();

        $customer = User::factory()->create(['role' => UserRoleEnum::CUSTOMER]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/payments/intents', [
            'order_id' => $order->public_id,
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseCount('payments', 1);
    }

    public function test_payment_intent_creation_is_idempotent_for_pending_payment(): void
    {
        $this->bindFakeGateway();

        $customer = User::factory()->create(['role' => UserRoleEnum::CUSTOMER]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);

        Sanctum::actingAs($customer);

        $first = $this->postJson('/api/v1/payments', [
            'order_id' => $order->public_id,
        ]);
        $second = $this->postJson('/api/v1/payments', [
            'order_id' => $order->public_id,
        ]);

        $first->assertOk()->assertJsonPath('success', true);
        $second->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseCount('payments', 1);
        $this->assertSame($first->json('data.id'), $second->json('data.id'));
    }

    public function test_payment_intent_retries_with_new_transaction_reference_when_gateway_rejects_reused_reference(): void
    {
        $tracker = new class
        {
            public int $attempts = 0;
            public array $refs = [];
        };

        $this->app->bind(PaymentGatewayInterface::class, fn () => new class($tracker) implements PaymentGatewayInterface {
            public function __construct(private readonly object $tracker)
            {
            }

            public function createIntent(array $payload): array
            {
                $this->tracker->attempts++;
                $this->tracker->refs[] = (string) $payload['tx_ref'];

                if ($this->tracker->attempts === 1) {
                    throw new RuntimeException('Transaction reference has been used before');
                }

                return [
                    'tx_ref' => $payload['tx_ref'],
                    'checkout_url' => 'https://checkout.test/' . $payload['tx_ref'],
                    'raw' => [
                        'status' => 'success',
                        'data' => [
                            'checkout_url' => 'https://checkout.test/' . $payload['tx_ref'],
                        ],
                    ],
                ];
            }

            public function verify(string $transactionRef): array
            {
                return [
                    'status' => 'success',
                    'raw' => [
                        'status' => 'success',
                        'data' => [
                            'status' => 'success',
                        ],
                    ],
                ];
            }
        });

        $customer = User::factory()->create(['role' => UserRoleEnum::CUSTOMER]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/payments/intents', [
            'order_id' => $order->public_id,
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSame(2, $tracker->attempts);
        $this->assertCount(2, $tracker->refs);
        $this->assertNotSame($tracker->refs[0], $tracker->refs[1]);

        $payment = Payment::query()->firstOrFail();
        $this->assertSame($tracker->refs[1], $payment->gateway_transaction_ref);
    }

    public function test_chapa_webhook_accepts_nested_tx_ref_with_valid_signature(): void
    {
        $this->bindFakeGateway();
        config()->set('services.chapa.webhook_secret', 'test-webhook-secret');

        $customer = User::factory()->create(['role' => UserRoleEnum::CUSTOMER]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'pending',
            'gateway_transaction_ref' => 'FD-WEBHOOK-REF-1',
        ]);

        $payload = [
            'data' => [
                'tx_ref' => $payment->gateway_transaction_ref,
            ],
        ];
        $signature = hash_hmac('sha256', json_encode($payload), 'test-webhook-secret');

        $response = $this
            ->withHeaders(['Chapa-Signature' => $signature])
            ->postJson('/api/v1/payments/webhook/chapa', $payload);

        $response->assertOk()->assertJsonPath('status', 'ok');
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'paid',
        ]);
    }

    public function test_chapa_webhook_rejects_invalid_signature(): void
    {
        $this->bindFakeGateway();
        config()->set('services.chapa.webhook_secret', 'test-webhook-secret');

        $response = $this
            ->withHeaders(['Chapa-Signature' => 'invalid'])
            ->postJson('/api/v1/payments/webhook/chapa', [
                'tx_ref' => 'FD-WEBHOOK-REF-2',
            ]);

        $response->assertUnauthorized();
    }
}
