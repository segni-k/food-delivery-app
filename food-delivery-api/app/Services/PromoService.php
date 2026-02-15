<?php

namespace App\Services;

use App\Enums\PromoCodeTypeEnum;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PromoService
{
    public function validate(string $code, float $subtotal, User $user): PromoCode
    {
        $promo = PromoCode::query()->where('code', strtoupper($code))->lockForUpdate()->firstOrFail();

        if (! $promo->is_active) {
            abort(422, 'Promo code is not active.');
        }

        if ($promo->expires_at && Carbon::parse($promo->expires_at)->isPast()) {
            abort(422, 'Promo code has expired.');
        }

        if ($promo->usage_limit > 0 && $promo->used_count >= $promo->usage_limit) {
            abort(422, 'Promo code usage limit reached.');
        }

        if ($subtotal < $promo->minimum_order_amount) {
            abort(422, 'Order does not meet promo minimum amount.');
        }

        return $promo;
    }

    public function calculateDiscount(PromoCode $promo, float $subtotal): float
    {
        if ($promo->type === PromoCodeTypeEnum::PERCENTAGE) {
            return round(($subtotal * (float) $promo->value) / 100, 2);
        }

        return min((float) $promo->value, $subtotal);
    }

    public function markUsed(PromoCode $promo, User $user, ?int $orderId = null): void
    {
        DB::transaction(function () use ($promo, $user, $orderId): void {
            $promo->refresh();
            $promo->increment('used_count');

            PromoCodeUsage::query()->create([
                'promo_code_id' => $promo->id,
                'user_id' => $user->id,
                'order_id' => $orderId,
            ]);
        });
    }
}
