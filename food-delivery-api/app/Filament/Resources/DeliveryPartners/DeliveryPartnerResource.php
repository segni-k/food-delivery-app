<?php

namespace App\Filament\Resources\DeliveryPartners;

use App\Enums\UserRoleEnum;
use App\Filament\Resources\Concerns\HasRoleBasedNavigation;
use App\Filament\Resources\DeliveryPartners\Pages\CreateDeliveryPartner;
use App\Filament\Resources\DeliveryPartners\Pages\EditDeliveryPartner;
use App\Filament\Resources\DeliveryPartners\Pages\ListDeliveryPartners;
use App\Filament\Resources\DeliveryPartners\Schemas\DeliveryPartnerForm;
use App\Filament\Resources\DeliveryPartners\Tables\DeliveryPartnersTable;
use App\Models\User;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class DeliveryPartnerResource extends Resource
{
    use HasRoleBasedNavigation;

    protected static ?string $model = User::class;
    protected static ?string $navigationLabel = 'Delivery Partners';
    protected static string|\UnitEnum|null $navigationGroup = 'Operations';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static function navigationRoles(): array
    {
        return [
            UserRoleEnum::ADMIN->value,
            UserRoleEnum::OPERATIONS->value,
            UserRoleEnum::SUPPORT->value,
        ];
    }

    public static function form(Schema $schema): Schema
    {
        return DeliveryPartnerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DeliveryPartnersTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListDeliveryPartners::route('/'),
            'create' => CreateDeliveryPartner::route('/create'),
            'edit' => EditDeliveryPartner::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('role', UserRoleEnum::DELIVERY_PARTNER);
    }

    public static function getRecordRouteBindingEloquentQuery(): Builder
    {
        return parent::getRecordRouteBindingEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ])
            ->where('role', UserRoleEnum::DELIVERY_PARTNER);
    }
}
