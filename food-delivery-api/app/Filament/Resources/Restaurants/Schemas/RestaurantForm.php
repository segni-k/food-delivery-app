<?php

namespace App\Filament\Resources\Restaurants\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class RestaurantForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('owner_id')->relationship('owner', 'name')->required(),
            TextInput::make('name')->required(),
            Textarea::make('description'),
            TextInput::make('address')
                ->required()
                ->placeholder('Bole, Addis Ababa, Ethiopia')
                ->helperText('Use a full address. Coordinates are resolved automatically.'),
            FileUpload::make('image_url')
                ->label('Restaurant photo')
                ->image()
                ->disk('public')
                ->directory('restaurants')
                ->fetchFileInformation(false)
                ->columnSpanFull(),
            FileUpload::make('banner_image_url')
                ->label('Restaurant banner')
                ->image()
                ->disk('public')
                ->directory('restaurant-banners')
                ->fetchFileInformation(false)
                ->columnSpanFull(),
            TextInput::make('delivery_radius_km')->numeric()->required(),
        ]);
    }
}
