<?php

namespace App\Filament\Resources\Payments\Schemas;

use App\Enums\PaymentStatusEnum;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PaymentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('order_id')->relationship('order', 'public_id')->searchable()->required(),
            TextInput::make('gateway')->default('chapa')->required(),
            TextInput::make('gateway_transaction_ref')->required(),
            TextInput::make('gateway_reference'),
            TextInput::make('amount')->numeric()->required(),
            TextInput::make('currency')->default('ETB')->required(),
            Select::make('status')->options(collect(PaymentStatusEnum::cases())->mapWithKeys(fn ($status) => [$status->value => ucfirst($status->value)])->all())->required(),
        ]);
    }
}
