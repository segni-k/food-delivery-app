<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Services\Admin\AdminCrudService;
use Filament\Actions\DeleteAction;
use Filament\Actions\ForceDeleteAction;
use Filament\Actions\RestoreAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()->using(fn ($record) => app(AdminCrudService::class)->delete($record)),
            ForceDeleteAction::make()->using(fn ($record) => app(AdminCrudService::class)->forceDelete($record)),
            RestoreAction::make()->using(fn ($record) => app(AdminCrudService::class)->restore($record)),
        ];
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        return app(AdminCrudService::class)->update($record, $data);
    }
}


