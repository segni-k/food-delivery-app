<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromoCodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'code' => $this->code,
            'type' => $this->type?->value,
            'value' => $this->value,
            'minimum_order_amount' => $this->minimum_order_amount,
            'usage_limit' => $this->usage_limit,
            'used_count' => $this->used_count,
            'expires_at' => $this->expires_at,
            'is_active' => $this->is_active,
        ];
    }
}
