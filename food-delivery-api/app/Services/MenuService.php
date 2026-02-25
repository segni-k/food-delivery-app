<?php

namespace App\Services;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class MenuService
{
    public function __construct(private readonly ImageUploadService $imageUploadService)
    {
    }

    public function listForApi(array $filters = []): LengthAwarePaginator
    {
        $restaurantIdentifier = $filters['restaurant_id'] ?? null;
        $categoryIdentifier = $filters['category_id'] ?? null;
        $search = trim((string) ($filters['search'] ?? ''));
        $perPage = max(1, min(50, (int) ($filters['per_page'] ?? 18)));
        $restaurantId = $this->resolveRestaurantId($restaurantIdentifier);
        $categoryId = $this->resolveCategoryId($categoryIdentifier, $restaurantId);

        return MenuItem::query()
            ->select([
                'id',
                'public_id',
                'restaurant_id',
                'menu_category_id',
                'name',
                'description',
                'price',
                'image_url',
                'is_available',
                'created_at',
            ])
            ->with([
                'category:id,public_id,restaurant_id,name,description,sort_order',
                'restaurant:id,public_id,name,image_url,banner_image_url',
            ])
            ->when($restaurantIdentifier !== null && $restaurantId === null, fn (Builder $query): Builder => $query->whereRaw('1 = 0'))
            ->when($restaurantId !== null, fn (Builder $query): Builder => $query->where('restaurant_id', $restaurantId))
            ->when($categoryIdentifier !== null && $categoryId === null, fn (Builder $query): Builder => $query->whereRaw('1 = 0'))
            ->when($categoryId !== null, fn (Builder $query): Builder => $query->where('menu_category_id', $categoryId))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%');
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    private function resolveRestaurantId(mixed $identifier): ?int
    {
        $value = trim((string) $identifier);
        if ($value === '') {
            return null;
        }

        return Restaurant::query()
            ->where('public_id', $value)
            ->orWhere('id', $value)
            ->value('id');
    }

    private function resolveCategoryId(mixed $identifier, ?int $restaurantId): ?int
    {
        $value = trim((string) $identifier);
        if ($value === '') {
            return null;
        }

        return MenuCategory::query()
            ->when($restaurantId !== null, fn (Builder $query): Builder => $query->where('restaurant_id', $restaurantId))
            ->where(function (Builder $query) use ($value): void {
                $query->where('public_id', $value)
                    ->orWhere('id', $value);
            })
            ->value('id');
    }

    public function getItemForApi(MenuItem $item): MenuItem
    {
        return $item->loadMissing(['category', 'restaurant']);
    }

    public function createCategory(Restaurant $restaurant, array $data): MenuCategory
    {
        return $restaurant->menuCategories()->create($data);
    }

    public function updateCategory(MenuCategory $category, array $data): MenuCategory
    {
        $category->update($data);

        return $category->refresh();
    }

    public function deleteCategory(MenuCategory $category): void
    {
        $category->delete();
    }

    public function createItem(Restaurant $restaurant, array $data): MenuItem
    {
        $payload = $data;

        if (isset($payload['image']) && $payload['image']) {
            $path = $this->imageUploadService->storeCompressed($payload['image'], 'menu-items');
            $payload['image_url'] = $path;
            unset($payload['image']);
        }

        return $restaurant->menuItems()->create($payload);
    }

    public function updateItem(MenuItem $item, array $data): MenuItem
    {
        $payload = $data;

        if (isset($payload['image']) && $payload['image']) {
            $path = $this->imageUploadService->storeCompressed($payload['image'], 'menu-items');
            $payload['image_url'] = $path;
            unset($payload['image']);
        }

        $item->update($payload);

        return $item->refresh();
    }

    public function deleteItem(MenuItem $item): void
    {
        $item->delete();
    }

    public function toggleAvailability(MenuItem $item, bool $isAvailable): MenuItem
    {
        $item->update(['is_available' => $isAvailable]);

        return $item->refresh();
    }
}
