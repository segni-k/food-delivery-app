<?php

namespace App\Policies;

use App\Enums\UserRoleEnum;
use App\Models\Restaurant;
use App\Models\User;

class RestaurantPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Restaurant $restaurant): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRoleEnum::RESTAURANT_OWNER, UserRoleEnum::ADMIN], true);
    }

    public function update(User $user, Restaurant $restaurant): bool
    {
        return $user->role === UserRoleEnum::ADMIN || $restaurant->owner_id === $user->id;
    }
}
