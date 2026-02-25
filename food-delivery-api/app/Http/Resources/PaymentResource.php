<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isPaid = $this->status?->value === 'paid';
        $receiptUrl = null;

        if ($isPaid) {
            $receiptUrl = data_get($this->gateway_payload, 'data.receipt_url');
            if (! is_string($receiptUrl) || trim($receiptUrl) === '') {
                $receiptBaseUrl = rtrim((string) config('services.chapa.receipt_base_url'), '/');
                if ($receiptBaseUrl !== '' && is_string($this->gateway_reference) && trim($this->gateway_reference) !== '') {
                    $receiptUrl = $receiptBaseUrl . '/' . trim((string) $this->gateway_reference);
                } else {
                    $receiptUrl = null;
                }
            }
        }

        return [
            'id' => $this->public_id,
            'order_id' => $this->order?->public_id,
            'gateway' => $this->gateway,
            'gateway_transaction_ref' => $this->gateway_transaction_ref,
            'gateway_reference' => $this->gateway_reference,
            'checkout_url' => data_get($this->gateway_payload, 'data.checkout_url'),
            'receipt_url' => $receiptUrl,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status?->value,
            'created_at' => $this->created_at,
        ];
    }
}
