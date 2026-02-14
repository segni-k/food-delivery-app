<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApplyPromoCodeRequest;
use App\Http\Resources\PromoCodeResource;
use App\Services\PromoService;

class PromoCodeController extends Controller
{
    public function __construct(private readonly PromoService $promoService)
    {
    }

    public function apply(ApplyPromoCodeRequest $request)
    {
        $promo = $this->promoService->validate(
            $request->validated('code'),
            (float) $request->validated('subtotal'),
            $request->user(),
        );

        $discount = $this->promoService->calculateDiscount($promo, (float) $request->validated('subtotal'));

        return $this->successResponse('Promo applied successfully.', [
            'promo' => new PromoCodeResource($promo),
            'discount_amount' => $discount,
        ]);
    }

    public function validateCode(ApplyPromoCodeRequest $request)
    {
        return $this->apply($request);
    }
}
