<?php

namespace App\Services\Admin;

use Illuminate\Database\Eloquent\Model;

class AdminCrudService
{
    public function create(string $modelClass, array $data): Model
    {
        return $modelClass::query()->create($data);
    }

    public function update(Model $record, array $data): Model
    {
        $record->update($data);

        return $record->refresh();
    }

    public function delete(Model $record): void
    {
        $record->delete();
    }

    public function restore(Model $record): void
    {
        $record->restore();
    }

    public function forceDelete(Model $record): void
    {
        $record->forceDelete();
    }
}
