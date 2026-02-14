<?php

namespace App\Policies;

use App\Enums\UserRoleEnum;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->role === UserRoleEnum::ADMIN
            || $order->customer_id === $user->id
            || $order->restaurant->owner_id === $user->id
            || $order->deliveryAssignments()->where('delivery_partner_id', $user->id)->exists();
    }

    public function updateStatus(User $user, Order $order): bool
    {
        return $user->role === UserRoleEnum::ADMIN || $order->restaurant->owner_id === $user->id;
    }
}
