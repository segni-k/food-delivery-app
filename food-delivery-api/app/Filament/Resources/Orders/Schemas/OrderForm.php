<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Enums\OrderStatusEnum;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('customer_id')->relationship('customer', 'name')->searchable()->required(),
            Select::make('restaurant_id')->relationship('restaurant', 'name')->searchable()->required(),
            Select::make('status')
                ->options(collect(OrderStatusEnum::cases())->mapWithKeys(fn ($status) => [$status->value => ucfirst(str_replace('_', ' ', $status->value))])->all())
                ->required(),
            TextInput::make('subtotal_amount')->numeric()->required(),
            TextInput::make('delivery_fee')->numeric()->default(0)->required(),
            TextInput::make('discount_amount')->numeric()->default(0)->required(),
            TextInput::make('total_amount')->numeric()->required(),
            TextInput::make('delivery_latitude')->numeric()->required(),
            TextInput::make('delivery_longitude')->numeric()->required(),
            Textarea::make('delivery_address')->required(),
            Textarea::make('notes'),
        ]);
    }
}
