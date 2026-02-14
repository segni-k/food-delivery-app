<?php

namespace App\Filament\Resources\Reviews\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ReviewForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('order_id')->relationship('order', 'public_id')->required(),
            Select::make('customer_id')->relationship('customer', 'name')->required(),
            Select::make('restaurant_id')->relationship('restaurant', 'name')->required(),
            Select::make('delivery_partner_id')->relationship('deliveryPartner', 'name'),
            TextInput::make('restaurant_rating')->numeric()->required(),
            TextInput::make('delivery_rating')->numeric(),
            Textarea::make('comment'),
        ]);
    }
}
