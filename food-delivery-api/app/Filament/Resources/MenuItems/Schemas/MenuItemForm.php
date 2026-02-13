<?php

namespace App\Filament\Resources\MenuItems\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class MenuItemForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('restaurant_id')->relationship('restaurant', 'name')->required(),
            Select::make('menu_category_id')->relationship('category', 'name')->required(),
            TextInput::make('name')->required(),
            Textarea::make('description'),
            TextInput::make('price')->numeric()->required(),
            TextInput::make('image_url')->url(),
            Toggle::make('is_available')->default(true),
        ]);
    }
}
