<?php

namespace App\Filament\Widgets;

use App\Enums\PaymentStatusEnum;
use App\Models\Payment;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class RevenueOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $paidRevenue = (float) Payment::query()->where('status', PaymentStatusEnum::PAID)->sum('amount');
        $pendingAmount = (float) Payment::query()->where('status', PaymentStatusEnum::PENDING)->sum('amount');

        return [
            Stat::make('Paid Revenue', number_format($paidRevenue, 2)),
            Stat::make('Pending Payments', number_format($pendingAmount, 2)),
        ];
    }
}
