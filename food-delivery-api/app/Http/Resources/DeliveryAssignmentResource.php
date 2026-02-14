<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'status' => $this->status?->value,
            'estimated_eta_minutes' => $this->estimated_eta_minutes,
            'delivery_partner' => new UserResource($this->whenLoaded('deliveryPartner')),
            'accepted_at' => $this->accepted_at,
            'rejected_at' => $this->rejected_at,
            'picked_up_at' => $this->picked_up_at,
            'delivered_at' => $this->delivered_at,
        ];
    }
}

