<?php

namespace Tests\Unit;

use App\Enums\UserRoleEnum;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;
use App\Events\OrderCreated;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_service_creates_order(): void
    {
        Event::fake([OrderCreated::class]);

        $customer = User::factory()->create(['role' => UserRoleEnum::CUSTOMER]);
        $owner = User::factory()->create(['role' => UserRoleEnum::RESTAURANT_OWNER]);
        $restaurant = Restaurant::factory()->create(['owner_id' => $owner->id]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'menu_category_id' => $category->id]);

        $service = app(OrderService::class);

        $order = $service->create($customer, [
            'restaurant_id' => $restaurant->id,
            'delivery_latitude' => $restaurant->latitude,
            'delivery_longitude' => $restaurant->longitude,
            'delivery_address' => 'Address',
            'items' => [
                ['menu_item_id' => $item->id, 'quantity' => 2],
            ],
        ]);

        $this->assertNotNull($order->id);
        $this->assertDatabaseCount('order_items', 1);
    }
}
