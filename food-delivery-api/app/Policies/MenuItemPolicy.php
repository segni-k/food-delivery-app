<?php

namespace App\Policies;

use App\Enums\UserRoleEnum;
use App\Models\MenuItem;
use App\Models\User;

class MenuItemPolicy
{
    public function update(User $user, MenuItem $menuItem): bool
    {
        return $user->role === UserRoleEnum::ADMIN || $menuItem->restaurant->owner_id === $user->id;
    }
}
