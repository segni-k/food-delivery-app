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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = max(1, min(50, (int) $request->integer('per_page', 15)));

        $with = [
            'restaurant:id,public_id,name,latitude,longitude,image_url,banner_image_url',
            'latestPayment:id,public_id,order_id,gateway,gateway_transaction_ref,gateway_reference,status,amount,currency,gateway_payload,created_at',
        ];

        if ($user?->role?->value === 'delivery_partner') {
            $with[] = 'deliveryAssignments:id,public_id,order_id,delivery_partner_id,status,estimated_eta_minutes,accepted_at,rejected_at,picked_up_at,delivered_at';
            $with[] = 'deliveryAssignments.deliveryPartner:id,public_id,name,email,phone,role,average_rating,created_at';
        }

        $orders = Order::query()
            ->select([
                'id',
                'public_id',
                'customer_id',
                'restaurant_id',
                'status',
                'subtotal_amount',
                'delivery_fee',
                'discount_amount',
                'total_amount',
                'delivery_latitude',
                'delivery_longitude',
                'delivery_address',
                'notes',
                'created_at',
            ])
            ->with($with)
            ->when($user?->role?->value === 'customer', fn (Builder $query) => $query->where('customer_id', $user->id))
            ->when($user?->role?->value === 'restaurant_owner', function (Builder $query) use ($user): void {
                $query->whereIn('restaurant_id', Restaurant::query()->select('id')->where('owner_id', $user->id));
            })
            ->when($user?->role?->value === 'delivery_partner', function (Builder $query) use ($user): void {
                $query->whereHas('deliveryAssignments', fn ($assignmentQuery) => $assignmentQuery->where('delivery_partner_id', $user->id));
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

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

        return $this->successResponse(
            'Order fetched successfully.',
            new OrderResource(
                $order->load([
                    'restaurant:id,public_id,name,description,address,image_url,banner_image_url,latitude,longitude,delivery_radius_km,average_rating,is_active,created_at',
                    'customer:id,public_id,name,email,phone,role,average_rating,created_at',
                    'items:id,public_id,order_id,menu_item_id,quantity,unit_price,total_price',
                    'items.menuItem:id,public_id,restaurant_id,menu_category_id,name,description,price,image_url,is_available',
                    'review',
                    'deliveryAssignments:id,public_id,order_id,delivery_partner_id,status,estimated_eta_minutes,accepted_at,rejected_at,picked_up_at,delivered_at',
                    'deliveryAssignments.deliveryPartner:id,public_id,name,email,phone,role,average_rating,created_at',
                    'latestPayment:id,public_id,order_id,gateway,gateway_transaction_ref,gateway_reference,status,amount,currency,gateway_payload,created_at',
                ])
            )
        );
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $this->authorize('updateStatus', $order);

        $updated = $this->orderService->updateStatus($order, OrderStatusEnum::from($request->validated('status')));

        return $this->successResponse(
            'Order status updated.',
            new OrderResource(
                $updated->load([
                    'restaurant:id,public_id,name,description,address,image_url,banner_image_url,latitude,longitude,delivery_radius_km,average_rating,is_active,created_at',
                    'customer:id,public_id,name,email,phone,role,average_rating,created_at',
                    'items:id,public_id,order_id,menu_item_id,quantity,unit_price,total_price',
                    'items.menuItem:id,public_id,restaurant_id,menu_category_id,name,description,price,image_url,is_available',
                    'review',
                    'deliveryAssignments:id,public_id,order_id,delivery_partner_id,status,estimated_eta_minutes,accepted_at,rejected_at,picked_up_at,delivered_at',
                    'deliveryAssignments.deliveryPartner:id,public_id,name,email,phone,role,average_rating,created_at',
                    'latestPayment:id,public_id,order_id,gateway,gateway_transaction_ref,gateway_reference,status,amount,currency,gateway_payload,created_at',
                ])
            )
        );
    }
}
