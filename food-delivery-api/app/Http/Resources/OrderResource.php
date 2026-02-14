<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $timeline = [
            'pending',
            'accepted',
            'preparing',
            'ready',
            'picked_up',
            'delivered',
        ];
        $currentStatus = $this->status?->value ?? 'pending';
        $currentIndex = array_search($currentStatus, $timeline, true);
        $currentIndex = $currentIndex === false ? 0 : $currentIndex;

        return [
            'id' => $this->public_id,
            'status' => $this->status?->value,
            'subtotal_amount' => $this->subtotal_amount,
            'delivery_fee' => $this->delivery_fee,
            'discount_amount' => $this->discount_amount,
            'total_amount' => $this->total_amount,
            'delivery_address' => $this->delivery_address,
            'delivery_latitude' => $this->delivery_latitude,
            'delivery_longitude' => $this->delivery_longitude,
            'notes' => $this->notes,
            'status_timeline' => array_map(
                fn (string $status, int $index): array => [
                    'status' => $status,
                    'completed' => $currentStatus === 'cancelled' ? false : $index <= $currentIndex,
                    'active' => $currentStatus === $status,
                ],
                $timeline,
                array_keys($timeline),
            ),
            'restaurant' => new RestaurantResource($this->whenLoaded('restaurant')),
            'customer' => new UserResource($this->whenLoaded('customer')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'review' => new ReviewResource($this->whenLoaded('review')),
            'delivery_assignments' => DeliveryAssignmentResource::collection($this->whenLoaded('deliveryAssignments')),
            'created_at' => $this->created_at,
        ];
    }
}
