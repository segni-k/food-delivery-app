<?php

namespace App\Policies;

use App\Enums\UserRoleEnum;
use App\Models\MenuCategory;
use App\Models\User;

class MenuCategoryPolicy
{
    public function update(User $user, MenuCategory $menuCategory): bool
    {
        return $user->role === UserRoleEnum::ADMIN || $menuCategory->restaurant->owner_id === $user->id;
    }
}
