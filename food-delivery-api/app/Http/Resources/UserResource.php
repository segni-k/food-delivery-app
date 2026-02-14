<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role?->value,
            'average_rating' => $this->average_rating,
            'addresses' => $this->whenLoaded('addresses', fn () => $this->addresses->map(fn ($address) => [
                'id' => $address->public_id,
                'label' => $address->label,
                'address_line' => $address->address_line,
                'latitude' => $address->latitude,
                'longitude' => $address->longitude,
                'is_default' => $address->is_default,
            ])->values()),
            'payment_cards' => $this->whenLoaded('paymentCards', fn () => $this->paymentCards->map(fn ($card) => [
                'id' => $card->public_id,
                'cardholder_name' => $card->cardholder_name,
                'brand' => $card->brand,
                'last4' => $card->last4,
                'exp_month' => $card->exp_month,
                'exp_year' => $card->exp_year,
                'is_default' => $card->is_default,
            ])->values()),
            'created_at' => $this->created_at,
        ];
    }
}
