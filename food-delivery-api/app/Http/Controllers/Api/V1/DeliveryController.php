<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignDeliveryPartnerRequest;
use App\Http\Requests\RespondDeliveryAssignmentRequest;
use App\Http\Requests\UpdateDeliveryProgressRequest;
use App\Http\Requests\ValidateDeliveryZoneRequest;
use App\Enums\DeliveryAssignmentStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\DeliveryAssignment;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\DeliveryService;
use App\Services\GeoLocationService;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(
        private readonly DeliveryService $deliveryService,
        private readonly GeoLocationService $geoLocationService,
    )
    {
    }

    public function accept(DeliveryAssignment $assignment)
    {
        $updated = $this->deliveryService->accept($assignment, request()->user());

        return $this->successResponse('Assignment accepted.', ['assignment_id' => $updated->public_id, 'status' => $updated->status->value]);
    }

    public function reject(DeliveryAssignment $assignment)
    {
        $updated = $this->deliveryService->reject($assignment, request()->user());

        return $this->successResponse('Assignment rejected.', ['assignment_id' => $updated->public_id, 'status' => $updated->status->value]);
    }

    public function validateZone(ValidateDeliveryZoneRequest $request)
    {
        $restaurantId = $request->validated('restaurant_id');

        $restaurant = Restaurant::query()
            ->where('public_id', $restaurantId)
            ->orWhere('id', $restaurantId)
            ->firstOrFail();

        $distanceKm = $this->geoLocationService->calculateDistanceKm(
            (float) $request->validated('delivery_latitude'),
            (float) $request->validated('delivery_longitude'),
            (float) $restaurant->latitude,
            (float) $restaurant->longitude,
        );

        $maxRadiusKm = (float) $restaurant->delivery_radius_km;
        $withinZone = $distanceKm <= $maxRadiusKm;
        $zoneName = $this->geoLocationService->nearestCityName((float) $restaurant->latitude, (float) $restaurant->longitude);
        $estimatedEta = $this->geoLocationService->estimateEtaMinutes($distanceKm);
        $estimatedDeliveryFee = $this->geoLocationService->estimateDeliveryFee($distanceKm);
        $routeEfficiencyScore = $this->geoLocationService->routeEfficiencyScore($distanceKm, $maxRadiusKm);
        $priorityTier = $distanceKm <= ($maxRadiusKm * 0.5)
            ? 'fast_lane'
            : ($withinZone ? 'standard' : 'out_of_zone');
        $guidance = $withinZone
            ? sprintf('This restaurant delivers in %s within %.2f km.', $zoneName, $maxRadiusKm)
            : sprintf('This restaurant currently delivers around %s within %.2f km from the restaurant.', $zoneName, $maxRadiusKm);

        return $this->successResponse('Delivery zone validated.', [
            'restaurant_id' => $restaurant->public_id,
            'within_zone' => $withinZone,
            'distance_km' => round($distanceKm, 2),
            'max_radius_km' => $maxRadiusKm,
            'zone_name' => $zoneName,
            'zone_message' => $guidance,
            'estimated_eta_minutes' => $estimatedEta,
            'estimated_delivery_fee' => $estimatedDeliveryFee,
            'route_efficiency_score' => $routeEfficiencyScore,
            'priority_tier' => $priorityTier,
            'restaurant_latitude' => (float) $restaurant->latitude,
            'restaurant_longitude' => (float) $restaurant->longitude,
        ]);
    }

    public function listPartners()
    {
        $partners = User::query()
            ->where('role', UserRoleEnum::DELIVERY_PARTNER)
            ->where('is_available_for_delivery', true)
            ->orderByDesc('average_rating')
            ->limit(100)
            ->get(['public_id', 'name', 'phone', 'average_rating', 'latitude', 'longitude']);

        return $this->successResponse('Delivery partners fetched successfully.', $partners);
    }

    public function assignPartner(AssignDeliveryPartnerRequest $request, Order $order)
    {
        $this->authorize('updateStatus', $order);

        $partnerIdentifier = $request->validated('delivery_partner_id');
        $partner = User::query()
            ->where('role', UserRoleEnum::DELIVERY_PARTNER)
            ->where(function ($query) use ($partnerIdentifier): void {
                $query
                    ->where('public_id', $partnerIdentifier)
                    ->orWhere('id', $partnerIdentifier);
            })
            ->firstOrFail();

        $assignment = DeliveryAssignment::query()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'delivery_partner_id' => $partner->id,
                'status' => DeliveryAssignmentStatusEnum::ASSIGNED,
                'estimated_eta_minutes' => (int) ($request->validated('estimated_eta_minutes') ?? 30),
            ]
        );

        return $this->successResponse('Delivery partner assigned successfully.', [
            'assignment_id' => $assignment->public_id,
            'order_id' => $order->public_id,
            'delivery_partner_id' => $partner->public_id,
            'delivery_partner_name' => $partner->name,
            'status' => $assignment->status->value,
        ]);
    }

    public function myDeliveries(Request $request)
    {
        $partner = $request->user();

        $assignments = DeliveryAssignment::query()
            ->with(['order.restaurant', 'order.customer', 'order.items.menuItem', 'deliveryPartner'])
            ->where('delivery_partner_id', $partner->id)
            ->latest()
            ->paginate((int) $request->integer('per_page', 15));

        $rows = $assignments->getCollection()->map(function (DeliveryAssignment $assignment): array {
            $order = $assignment->order;
            $distanceKm = $this->geoLocationService->calculateDistanceKm(
                (float) $order->restaurant->latitude,
                (float) $order->restaurant->longitude,
                (float) $order->delivery_latitude,
                (float) $order->delivery_longitude,
            );

            // Baseline ETA model: prep + distance-weighted transit.
            $etaMinutes = max(10, (int) round(($distanceKm * 4.5) + 12));

            return [
                'assignment_id' => $assignment->public_id,
                'assignment_status' => $assignment->status->value,
                'estimated_eta_minutes' => $assignment->estimated_eta_minutes ?: $etaMinutes,
                'order' => [
                    'id' => $order->public_id,
                    'status' => $order->status->value,
                    'delivery_address' => $order->delivery_address,
                    'delivery_latitude' => (float) $order->delivery_latitude,
                    'delivery_longitude' => (float) $order->delivery_longitude,
                    'customer' => [
                        'id' => $order->customer?->public_id,
                        'name' => $order->customer?->name,
                        'phone' => $order->customer?->phone,
                    ],
                    'total_amount' => (float) $order->total_amount,
                    'restaurant' => [
                        'id' => $order->restaurant->public_id,
                        'name' => $order->restaurant->name,
                        'latitude' => (float) $order->restaurant->latitude,
                        'longitude' => (float) $order->restaurant->longitude,
                    ],
                    'items' => $order->items->map(fn ($item): array => [
                        'id' => $item->public_id,
                        'quantity' => $item->quantity,
                        'menu_item' => [
                            'id' => $item->menuItem?->public_id,
                            'name' => $item->menuItem?->name,
                        ],
                    ])->values(),
                ],
            ];
        });

        return $this->successResponse('Deliveries fetched successfully.', [
            'data' => $rows,
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ],
        ]);
    }

    public function respondToAssignment(RespondDeliveryAssignmentRequest $request, Order $order)
    {
        $partner = $request->user();
        $assignment = $this->deliveryService->getAssignmentForOrderAndPartner($order, $partner);
        $action = $request->validated('action');

        $updated = $action === 'accept'
            ? $this->deliveryService->accept($assignment, $partner)
            : $this->deliveryService->reject($assignment, $partner);

        return $this->successResponse('Assignment updated successfully.', [
            'order_id' => $order->public_id,
            'assignment_id' => $updated->public_id,
            'assignment_status' => $updated->status->value,
        ]);
    }

    public function updateDeliveryStatus(UpdateDeliveryProgressRequest $request, Order $order)
    {
        $partner = $request->user();
        $status = $request->validated('status');

        $updated = $this->deliveryService->updateProgress($order, $partner, $status);

        return $this->successResponse('Delivery status updated successfully.', [
            'order_id' => $order->public_id,
            'assignment_id' => $updated->public_id,
            'assignment_status' => $updated->status->value,
            'order_status' => $order->refresh()->status->value,
        ]);
    }
}
