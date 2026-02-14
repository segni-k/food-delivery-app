<?php

namespace App\Policies;

use App\Enums\OrderStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function createForOrder(User $user, Order $order): bool
    {
        return $user->role === UserRoleEnum::CUSTOMER
            && $order->customer_id === $user->id
            && $order->status === OrderStatusEnum::DELIVERED
            && ! $order->review()->exists();
    }

    public function view(User $user, Review $review): bool
    {
        return $user->role === UserRoleEnum::ADMIN || $review->customer_id === $user->id;
    }
}
