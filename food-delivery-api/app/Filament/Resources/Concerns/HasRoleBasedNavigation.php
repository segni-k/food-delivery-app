<?php

namespace App\Filament\Resources\Concerns;

use App\Enums\UserRoleEnum;
use App\Models\User;

trait HasRoleBasedNavigation
{
    protected static function navigationRoles(): array
    {
        return UserRoleEnum::staffPanelRoles();
    }

    public static function shouldRegisterNavigation(): bool
    {
        $user = auth()->user();

        if (! $user instanceof User) {
            return false;
        }

        if ($user->role === UserRoleEnum::ADMIN) {
            return true;
        }

        return in_array($user->role->value, static::navigationRoles(), true);
    }
}
