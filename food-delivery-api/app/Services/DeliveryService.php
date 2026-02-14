<?php

namespace App\Services;

use App\Enums\DeliveryAssignmentStatusEnum;
use App\Enums\OrderStatusEnum;
use App\Enums\UserRoleEnum;
use App\Events\DeliveryAssigned;
use App\Models\DeliveryAssignment;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Carbon;

class DeliveryService
{
    public function __construct(private readonly GeoLocationService $geoLocationService)
    {
    }

    public function assignNearestPartner(Order $order): ?DeliveryAssignment
    {
        $restaurant = $order->restaurant;

        $partner = User::query()
            ->where('role', UserRoleEnum::DELIVERY_PARTNER)
            ->where('is_available_for_delivery', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->sortBy(fn (User $candidate): float => $this->geoLocationService->calculateDistanceKm(
                (float) $restaurant->latitude,
                (float) $restaurant->longitude,
                (float) $candidate->latitude,
                (float) $candidate->longitude,
            ))
            ->first();

        if (! $partner) {
            return null;
        }

        $assignment = $order->deliveryAssignments()->create([
            'delivery_partner_id' => $partner->id,
            'status' => DeliveryAssignmentStatusEnum::ASSIGNED,
            'estimated_eta_minutes' => 30,
        ]);

        event(new DeliveryAssigned($assignment));

        return $assignment;
    }

    public function accept(DeliveryAssignment $assignment, User $partner): DeliveryAssignment
    {
        if ($assignment->delivery_partner_id !== $partner->id) {
            abort(403, 'You are not allowed to accept this assignment.');
        }

        $assignment->update([
            'status' => DeliveryAssignmentStatusEnum::ACCEPTED,
            'accepted_at' => now(),
        ]);

        return $assignment->refresh();
    }

    public function reject(DeliveryAssignment $assignment, User $partner): DeliveryAssignment
    {
        if ($assignment->delivery_partner_id !== $partner->id) {
            abort(403, 'You are not allowed to reject this assignment.');
        }

        $assignment->update([
            'status' => DeliveryAssignmentStatusEnum::REJECTED,
            'rejected_at' => now(),
        ]);

        return $assignment->refresh();
    }

    public function getAssignmentForOrderAndPartner(Order $order, User $partner): DeliveryAssignment
    {
        return $order->deliveryAssignments()
            ->where('delivery_partner_id', $partner->id)
            ->latest()
            ->firstOrFail();
    }

    public function updateProgress(Order $order, User $partner, string $status): DeliveryAssignment
    {
        $assignment = $this->getAssignmentForOrderAndPartner($order, $partner);

        if ($status === 'picked_up') {
            if ($order->status !== OrderStatusEnum::READY) {
                abort(422, 'Order must be ready before pickup.');
            }

            $order->update(['status' => OrderStatusEnum::PICKED_UP]);
            $assignment->update([
                'status' => DeliveryAssignmentStatusEnum::IN_TRANSIT,
                'picked_up_at' => Carbon::now(),
            ]);
        }

        if ($status === 'delivered') {
            if ($order->status !== OrderStatusEnum::PICKED_UP) {
                abort(422, 'Order must be picked up before marking delivered.');
            }

            $order->update(['status' => OrderStatusEnum::DELIVERED]);
            $assignment->update([
                'status' => DeliveryAssignmentStatusEnum::COMPLETED,
                'delivered_at' => Carbon::now(),
            ]);
        }

        return $assignment->refresh();
    }
}
