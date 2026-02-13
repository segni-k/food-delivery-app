<?php

namespace App\Filament\Resources\MenuCategories\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class MenuCategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('restaurant_id')->relationship('restaurant', 'name')->required(),
            TextInput::make('name')->required(),
            Textarea::make('description'),
            TextInput::make('sort_order')->numeric()->default(0),
        ]);
    }
}
