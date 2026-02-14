<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Restaurant;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $orders = Order::query()
            ->with(['restaurant', 'customer', 'items.menuItem', 'review', 'deliveryAssignments.deliveryPartner'])
            ->when($user?->role?->value === 'customer', fn ($query) => $query->where('customer_id', $user->id))
            ->when($user?->role?->value === 'restaurant_owner', function ($query) use ($user): void {
                $restaurantIds = Restaurant::query()->where('owner_id', $user->id)->pluck('id');
                $query->whereIn('restaurant_id', $restaurantIds);
            })
            ->when($user?->role?->value === 'delivery_partner', function ($query) use ($user): void {
                $query->whereHas('deliveryAssignments', fn ($assignmentQuery) => $assignmentQuery->where('delivery_partner_id', $user->id));
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 15));

        return $this->successResponse('Orders fetched successfully.', OrderResource::collection($orders));
    }

    public function store(StoreOrderRequest $request)
    {
        $order = $this->orderService->create($request->user(), $request->validated());

        return $this->successResponse('Order placed successfully.', new OrderResource($order), 201);
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);

        return $this->successResponse('Order fetched successfully.', new OrderResource($order->load(['restaurant', 'customer', 'items.menuItem', 'review', 'deliveryAssignments.deliveryPartner'])));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $this->authorize('updateStatus', $order);

        $updated = $this->orderService->updateStatus($order, OrderStatusEnum::from($request->validated('status')));

        return $this->successResponse('Order status updated.', new OrderResource($updated->load(['restaurant', 'customer', 'items.menuItem', 'review', 'deliveryAssignments.deliveryPartner'])));
    }
}
