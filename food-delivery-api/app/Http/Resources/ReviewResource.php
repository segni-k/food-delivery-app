<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'order_id' => $this->order?->public_id,
            'restaurant_rating' => $this->restaurant_rating,
            'delivery_rating' => $this->delivery_rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at,
        ];
    }
}
