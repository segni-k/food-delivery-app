<?php

namespace App\Filament\Resources\MenuCategories\Pages;

use App\Filament\Resources\MenuCategories\MenuCategoryResource;
use App\Services\Admin\AdminCrudService;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateMenuCategory extends CreateRecord
{
    protected static string $resource = MenuCategoryResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        return app(AdminCrudService::class)->create($this->getModel(), $data);
    }
}
