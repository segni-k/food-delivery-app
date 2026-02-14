<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuCategoryRequest;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\ToggleMenuItemAvailabilityRequest;
use App\Http\Requests\UpdateMenuCategoryRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Http\Resources\MenuCategoryResource;
use App\Http\Resources\MenuItemResource;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Services\MenuService;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function __construct(private readonly MenuService $menuService)
    {
    }

    public function index(Request $request)
    {
        $items = $this->menuService->listForApi([
            'restaurant_id' => $request->query('restaurant_id'),
            'category_id' => $request->query('category_id'),
            'search' => $request->query('search'),
            'per_page' => (int) $request->integer('per_page', 18),
        ]);

        return $this->successResponse('Menu items fetched successfully.', MenuItemResource::collection($items));
    }

    public function show(MenuItem $menuItem)
    {
        $item = $this->menuService->getItemForApi($menuItem);

        return $this->successResponse('Menu item fetched successfully.', new MenuItemResource($item));
    }

    public function indexCategories(Restaurant $restaurant)
    {
        $this->authorize('update', $restaurant);
        $categories = $restaurant->menuCategories()->orderBy('sort_order')->get();

        return $this->successResponse('Categories fetched successfully.', MenuCategoryResource::collection($categories));
    }

    public function indexItems(Restaurant $restaurant, Request $request)
    {
        $this->authorize('update', $restaurant);

        $items = $this->menuService->listForApi([
            'restaurant_id' => $restaurant->public_id,
            'category_id' => $request->query('category_id'),
            'search' => $request->query('search'),
            'per_page' => (int) $request->integer('per_page', 25),
        ]);

        return $this->successResponse('Restaurant menu items fetched successfully.', MenuItemResource::collection($items));
    }

    public function storeCategory(StoreMenuCategoryRequest $request, Restaurant $restaurant)
    {
        $this->authorize('update', $restaurant);

        $category = $this->menuService->createCategory($restaurant, $request->validated());

        return $this->successResponse('Category created successfully.', new MenuCategoryResource($category), 201);
    }

    public function storeItem(StoreMenuItemRequest $request, Restaurant $restaurant)
    {
        $this->authorize('update', $restaurant);

        $payload = $request->validated();
        $payload['menu_category_id'] = $this->resolveMenuCategoryId($restaurant, (string) $payload['menu_category_id']);
        $payload['image'] = $request->file('image');

        $item = $this->menuService->createItem($restaurant, $payload);

        return $this->successResponse('Menu item created successfully.', new MenuItemResource($item), 201);
    }

    public function updateCategory(UpdateMenuCategoryRequest $request, Restaurant $restaurant, MenuCategory $category)
    {
        $this->authorize('update', $restaurant);
        $this->ensureCategoryBelongsToRestaurant($restaurant, $category);

        $updated = $this->menuService->updateCategory($category, $request->validated());

        return $this->successResponse('Category updated successfully.', new MenuCategoryResource($updated));
    }

    public function destroyCategory(Restaurant $restaurant, MenuCategory $category)
    {
        $this->authorize('update', $restaurant);
        $this->ensureCategoryBelongsToRestaurant($restaurant, $category);

        $this->menuService->deleteCategory($category);

        return $this->successResponse('Category deleted successfully.');
    }

    public function updateItem(UpdateMenuItemRequest $request, Restaurant $restaurant, MenuItem $item)
    {
        $this->authorize('update', $restaurant);
        $this->ensureItemBelongsToRestaurant($restaurant, $item);

        $payload = $request->validated();
        if (array_key_exists('menu_category_id', $payload)) {
            $payload['menu_category_id'] = $this->resolveMenuCategoryId($restaurant, (string) $payload['menu_category_id']);
        }
        $payload['image'] = $request->file('image');

        $updated = $this->menuService->updateItem($item, $payload);

        return $this->successResponse('Menu item updated successfully.', new MenuItemResource($updated));
    }

    public function destroyItem(Restaurant $restaurant, MenuItem $item)
    {
        $this->authorize('update', $restaurant);
        $this->ensureItemBelongsToRestaurant($restaurant, $item);

        $this->menuService->deleteItem($item);

        return $this->successResponse('Menu item deleted successfully.');
    }

    public function toggleItemAvailability(ToggleMenuItemAvailabilityRequest $request, Restaurant $restaurant, MenuItem $item)
    {
        $this->authorize('update', $restaurant);
        $this->ensureItemBelongsToRestaurant($restaurant, $item);

        $updated = $this->menuService->toggleAvailability($item, (bool) $request->validated('is_available'));

        return $this->successResponse('Menu item availability updated.', new MenuItemResource($updated));
    }

    private function resolveMenuCategoryId(Restaurant $restaurant, string $categoryIdentifier): int
    {
        $category = MenuCategory::query()
            ->where('restaurant_id', $restaurant->id)
            ->where(function ($query) use ($categoryIdentifier): void {
                $query
                    ->where('public_id', $categoryIdentifier)
                    ->orWhere('id', $categoryIdentifier);
            })
            ->firstOrFail();

        return (int) $category->id;
    }

    private function ensureCategoryBelongsToRestaurant(Restaurant $restaurant, MenuCategory $category): void
    {
        if ($category->restaurant_id !== $restaurant->id) {
            abort(404, 'Category not found for this restaurant.');
        }
    }

    private function ensureItemBelongsToRestaurant(Restaurant $restaurant, MenuItem $item): void
    {
        if ($item->restaurant_id !== $restaurant->id) {
            abort(404, 'Menu item not found for this restaurant.');
        }
    }
}
