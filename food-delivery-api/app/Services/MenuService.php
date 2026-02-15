<?php

namespace App\Services;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MenuService
{
    public function __construct(private readonly ImageUploadService $imageUploadService)
    {
    }

    public function listForApi(array $filters = []): LengthAwarePaginator
    {
        $restaurantPublicId = $filters['restaurant_id'] ?? null;
        $categoryPublicId = $filters['category_id'] ?? null;
        $search = trim((string) ($filters['search'] ?? ''));
        $perPage = max(1, min(50, (int) ($filters['per_page'] ?? 18)));

        return MenuItem::query()
            ->with(['category', 'restaurant'])
            ->when($restaurantPublicId, function ($query, $restaurantPublicId): void {
                $query->whereHas('restaurant', fn ($restaurantQuery) => $restaurantQuery->where('public_id', $restaurantPublicId));
            })
            ->when($categoryPublicId, function ($query, $categoryPublicId): void {
                $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('public_id', $categoryPublicId));
            })
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
