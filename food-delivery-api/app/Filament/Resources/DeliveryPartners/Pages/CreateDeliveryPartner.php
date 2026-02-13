<?php

namespace App\Filament\Resources\DeliveryPartners\Pages;

use App\Enums\UserRoleEnum;
use App\Filament\Resources\DeliveryPartners\DeliveryPartnerResource;
use App\Services\Admin\AdminCrudService;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateDeliveryPartner extends CreateRecord
{
    protected static string $resource = DeliveryPartnerResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $data['role'] = UserRoleEnum::DELIVERY_PARTNER;

        return app(AdminCrudService::class)->create($this->getModel(), $data);
    }
}
