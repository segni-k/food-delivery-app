<?php

namespace App\Filament\Resources\Orders\Tables;

use App\Enums\OrderStatusEnum;
use App\Services\DeliveryService;
use App\Services\OrderService;
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

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('public_id')->label('Order')->searchable(),
                TextColumn::make('customer.name')->searchable(),
                TextColumn::make('restaurant.name')->searchable(),
                TextColumn::make('status')->badge()->searchable(),
                TextColumn::make('total_amount')->money('ETB')->sortable(),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->options(collect(OrderStatusEnum::cases())->mapWithKeys(fn ($status) => [$status->value => ucfirst(str_replace('_', ' ', $status->value))])->all()),
                SelectFilter::make('restaurant_id')->relationship('restaurant', 'name')->searchable(),
                TrashedFilter::make(),
            ])
            ->recordActions([
                Action::make('assign_delivery_partner')
                    ->label('Assign Delivery Partner')
                    ->icon('heroicon-o-truck')
                    ->color('info')
                    ->requiresConfirmation()
                    ->action(function ($record): void {
                        $assignment = app(DeliveryService::class)->assignNearestPartner($record->load('restaurant'));

                        if (! $assignment) {
                            Notification::make()->title('No available partner found.')->warning()->send();

                            return;
                        }

                        Notification::make()->title('Delivery partner assigned.')->success()->send();
                    }),
                Action::make('cancel_order')
                    ->label('Cancel Order')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->action(function ($record): void {
                        app(OrderService::class)->cancel($record);
                        Notification::make()->title('Order cancelled.')->success()->send();
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
