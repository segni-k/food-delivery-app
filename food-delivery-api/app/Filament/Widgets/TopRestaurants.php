<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;

class TopRestaurants extends ChartWidget
{
    protected ?string $heading = 'Top Restaurants (By Revenue)';

    protected function getData(): array
    {
        $rows = Order::query()
            ->selectRaw('restaurants.name as restaurant_name, SUM(orders.total_amount) as total_revenue')
            ->join('restaurants', 'restaurants.id', '=', 'orders.restaurant_id')
            ->groupBy('restaurants.name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        return [
            'datasets' => [[
                'label' => 'Revenue',
                'data' => $rows->pluck('total_revenue')->map(fn ($value) => (float) $value)->all(),
            ]],
            'labels' => $rows->pluck('restaurant_name')->all(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
