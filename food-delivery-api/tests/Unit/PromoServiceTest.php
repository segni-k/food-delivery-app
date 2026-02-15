<?php

namespace Tests\Unit;

use App\Enums\PromoCodeTypeEnum;
use App\Models\PromoCode;
use App\Models\User;
use App\Services\PromoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromoServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_promo_service_validates_and_calculates_discount(): void
    {
        $promo = PromoCode::factory()->create([
            'code' => 'SAVE10',
            'type' => PromoCodeTypeEnum::PERCENTAGE,
            'value' => 10,
            'minimum_order_amount' => 50,
        ]);

        $user = User::factory()->create();
        $service = app(PromoService::class);

        $validated = $service->validate('SAVE10', 100, $user);
        $discount = $service->calculateDiscount($validated, 100);

        $this->assertEquals(10.0, $discount);
    }
}
