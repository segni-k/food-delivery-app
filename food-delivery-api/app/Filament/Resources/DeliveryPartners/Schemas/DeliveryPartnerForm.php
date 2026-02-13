<?php

namespace App\Filament\Resources\DeliveryPartners\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class DeliveryPartnerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->maxLength(255),
            TextInput::make('email')->email()->required()->maxLength(255),
            TextInput::make('phone')->maxLength(20),
            TextInput::make('latitude')->numeric(),
            TextInput::make('longitude')->numeric(),
            Toggle::make('is_available_for_delivery')->default(true),
            TextInput::make('password')
                ->password()
                ->required(fn (string $operation): bool => $operation === 'create')
                ->dehydrated(fn ($state) => filled($state)),
        ]);
    }
}
