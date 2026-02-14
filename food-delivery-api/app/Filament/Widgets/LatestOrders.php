<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestOrders extends BaseWidget
{
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::query()->latest()->limit(10))
            ->columns([
                TextColumn::make('public_id')->label('Order')->searchable(),
                TextColumn::make('customer.name')->label('Customer'),
                TextColumn::make('restaurant.name')->label('Restaurant'),
                TextColumn::make('status')->badge(),
                TextColumn::make('total_amount')->money('ETB'),
                TextColumn::make('created_at')->dateTime(),
            ]);
    }
}
