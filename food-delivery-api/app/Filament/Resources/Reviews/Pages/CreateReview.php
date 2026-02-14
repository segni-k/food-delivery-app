<?php

namespace App\Filament\Resources\Reviews\Pages;

use App\Filament\Resources\Reviews\ReviewResource;
use App\Services\Admin\AdminCrudService;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateReview extends CreateRecord
{
    protected static string $resource = ReviewResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        return app(AdminCrudService::class)->create($this->getModel(), $data);
    }
}
