<?php

namespace App\Filament\Resources\PromoCodes\Schemas;

use App\Enums\PromoCodeTypeEnum;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PromoCodeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('code')->required(),
            Select::make('type')->options(collect(PromoCodeTypeEnum::cases())->mapWithKeys(fn ($type) => [$type->value => ucfirst($type->value)])->all())->required(),
            TextInput::make('value')->numeric()->required(),
            TextInput::make('minimum_order_amount')->numeric()->default(0)->required(),
            TextInput::make('usage_limit')->numeric()->required(),
            TextInput::make('used_count')->numeric()->default(0),
            DateTimePicker::make('expires_at'),
            Toggle::make('is_active')->default(true),
        ]);
    }
}
