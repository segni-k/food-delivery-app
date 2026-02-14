<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Services\ReviewService;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviewService)
    {
    }

    public function store(StoreReviewRequest $request)
    {
        $orderId = $request->validated('order_id');
        $order = Order::query()
            ->with(['deliveryAssignments', 'review'])
            ->where('public_id', $orderId)
            ->orWhere('id', $orderId)
            ->firstOrFail();

        if ($order->review) {
            abort(422, 'A review has already been submitted for this order.');
        }

        $this->authorize('createForOrder', [\App\Models\Review::class, $order]);

        $assignment = $order->deliveryAssignments()->latest()->first();

        $review = $this->reviewService->create([
            'order_id' => $order->id,
            'customer_id' => $request->user()->id,
            'restaurant_id' => $order->restaurant_id,
            'delivery_partner_id' => $assignment?->delivery_partner_id,
            'restaurant_rating' => $request->validated('restaurant_rating'),
            'delivery_rating' => $request->validated('delivery_rating'),
            'comment' => $request->validated('comment'),
        ]);

        return $this->successResponse('Review submitted successfully.', new ReviewResource($review), 201);
    }
}
