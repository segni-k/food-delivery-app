<?php

namespace App\Filament\Resources\Payments\Tables;

use App\Enums\PaymentStatusEnum;
use App\Services\PaymentService;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ForceDeleteBulkAction;
use Filament\Actions\RestoreBulkAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;

class PaymentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order.public_id')->label('Order')->searchable(),
                TextColumn::make('gateway')->searchable(),
                TextColumn::make('gateway_transaction_ref')->searchable()->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('amount')->money('ETB')->sortable(),
                TextColumn::make('currency')->searchable(),
                TextColumn::make('status')->badge()->searchable(),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->options(collect(PaymentStatusEnum::cases())->mapWithKeys(fn ($status) => [$status->value => ucfirst($status->value)])->all()),
                SelectFilter::make('gateway')->options(['chapa' => 'Chapa']),
                TrashedFilter::make(),
            ])
            ->recordActions([
                Action::make('refund_payment')
                    ->label('Refund Payment')
                    ->icon('heroicon-o-arrow-uturn-left')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->visible(fn ($record): bool => $record->status === PaymentStatusEnum::PAID)
                    ->action(function ($record): void {
                        app(PaymentService::class)->refund($record, 'Manual admin refund');
                        Notification::make()->title('Payment refunded successfully.')->success()->send();
                    }),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    ForceDeleteBulkAction::make(),
                    RestoreBulkAction::make(),
                ]),
            ]);
    }
}
