<?php

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly GeoLocationService $geoLocationService,
        private readonly PromoService $promoService,
    ) {
    }

    public function create(User $customer, array $payload): Order
    {
        return DB::transaction(function () use ($customer, $payload): Order {
            $restaurant = \App\Models\Restaurant::query()
                ->where('public_id', $payload['restaurant_id'])
                ->orWhere('id', $payload['restaurant_id'])
                ->firstOrFail();

            $this->geoLocationService->ensureInDeliveryRadius(
                (float) $payload['delivery_latitude'],
                (float) $payload['delivery_longitude'],
                (float) $restaurant->latitude,
                (float) $restaurant->longitude,
                (float) $restaurant->delivery_radius_km,
            );
            $deliveryDistanceKm = $this->geoLocationService->calculateDistanceKm(
                (float) $payload['delivery_latitude'],
                (float) $payload['delivery_longitude'],
                (float) $restaurant->latitude,
                (float) $restaurant->longitude,
            );

            $itemIdentifiers = collect($payload['items'])->pluck('menu_item_id')->all();
            $menuItems = MenuItem::query()
                ->where('restaurant_id', $restaurant->id)
                ->where('is_available', true)
                ->where(function ($query) use ($itemIdentifiers): void {
                    $query
                        ->whereIn('id', $itemIdentifiers)
                        ->orWhereIn('public_id', $itemIdentifiers);
                })
                ->get()
                ->keyBy(fn (MenuItem $item) => (string) $item->public_id);

            $menuItemsById = $menuItems->keyBy(fn (MenuItem $item) => (string) $item->id);

            $subtotal = 0;
            foreach ($payload['items'] as $line) {
                $identifier = (string) $line['menu_item_id'];
                $item = $menuItems->get($identifier) ?? $menuItemsById->get($identifier);
                if (! $item) {
                    abort(422, 'One or more menu items are invalid or unavailable.');
                }
                $subtotal += (float) $item->price * (int) $line['quantity'];
            }

            $promo = null;
            $discount = 0;
            if (! empty($payload['promo_code'])) {
                $promo = $this->promoService->validate($payload['promo_code'], $subtotal, $customer);
                $discount = $this->promoService->calculateDiscount($promo, $subtotal);
            }

            $deliveryFee = $this->geoLocationService->estimateDeliveryFee($deliveryDistanceKm);
            $total = max($subtotal + $deliveryFee - $discount, 0);

            $order = Order::query()->create([
                'customer_id' => $customer->id,
                'restaurant_id' => $restaurant->id,
                'promo_code_id' => $promo?->id,
                'status' => OrderStatusEnum::PENDING,
                'subtotal_amount' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount_amount' => $discount,
                'total_amount' => $total,
                'delivery_latitude' => $payload['delivery_latitude'],
                'delivery_longitude' => $payload['delivery_longitude'],
                'delivery_address' => $payload['delivery_address'],
                'notes' => Arr::get($payload, 'notes'),
            ]);

            foreach ($payload['items'] as $line) {
                $identifier = (string) $line['menu_item_id'];
                $item = $menuItems->get($identifier) ?? $menuItemsById->get($identifier);
                $quantity = (int) $line['quantity'];
                $unitPrice = (float) $item->price;
                $order->items()->create([
                    'menu_item_id' => $item->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $quantity * $unitPrice,
                ]);
            }

            if ($promo instanceof PromoCode) {
                $this->promoService->markUsed($promo, $customer, $order->id);
            }

            event(new OrderCreated($order));

            return $order->load(['items.menuItem', 'restaurant', 'customer']);
        });
    }

    public function updateStatus(Order $order, OrderStatusEnum $newStatus): Order
    {
        $currentStatus = $order->status;

        if (! $currentStatus->canTransitionTo($newStatus)) {
            abort(422, 'Invalid status transition.');
        }

        $order->update(['status' => $newStatus]);

        event(new OrderStatusUpdated($order->refresh(), $currentStatus, $newStatus));

        return $order->refresh();
    }

    public function cancel(Order $order): Order
    {
        return $this->updateStatus($order, OrderStatusEnum::CANCELLED);
    }
}
