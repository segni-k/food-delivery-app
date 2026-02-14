<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;

class OrderTrends extends ChartWidget
{
    protected ?string $heading = 'Order Trends (Last 7 Days)';

    protected function getData(): array
    {
        $rows = Order::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'datasets' => [[
                'label' => 'Orders',
                'data' => $rows->pluck('total')->all(),
            ]],
            'labels' => $rows->pluck('date')->all(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
