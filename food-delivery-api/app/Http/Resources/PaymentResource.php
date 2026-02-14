<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'order_id' => $this->order?->public_id,
            'gateway' => $this->gateway,
            'gateway_transaction_ref' => $this->gateway_transaction_ref,
            'checkout_url' => data_get($this->gateway_payload, 'data.checkout_url'),
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status?->value,
            'created_at' => $this->created_at,
        ];
    }
}
