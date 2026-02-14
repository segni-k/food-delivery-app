<?php

namespace App\Filament\Widgets;

use App\Enums\UserRoleEnum;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class CustomerMetrics extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $customers = User::query()->where('role', UserRoleEnum::CUSTOMER)->count();
        $deliveryPartners = User::query()->where('role', UserRoleEnum::DELIVERY_PARTNER)->count();

        return [
            Stat::make('Customers', (string) $customers),
            Stat::make('Delivery Partners', (string) $deliveryPartners),
        ];
    }
}
