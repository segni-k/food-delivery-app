<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Services\Admin\AdminCrudService;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        try {
            return app(AdminCrudService::class)->create($this->getModel(), $data);
        } catch (QueryException $exception) {
            if (str_contains(strtolower($exception->getMessage()), 'users.email')) {
                throw ValidationException::withMessages([
                    'email' => 'This email is already registered. Please use a different email.',
                ]);
            }

            throw $exception;
        }
    }
}
