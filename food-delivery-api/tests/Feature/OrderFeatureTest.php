<?php

namespace Tests\Feature;

use App\Enums\UserRoleEnum;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Events\OrderCreated;

class OrderFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_place_order(): void
    {
        Event::fake([OrderCreated::class]);

        $customer = User::factory()->create(['role' => UserRoleEnum::CUSTOMER]);
        $owner = User::factory()->create(['role' => UserRoleEnum::RESTAURANT_OWNER]);
        $restaurant = Restaurant::factory()->create(['owner_id' => $owner->id]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create([
            'restaurant_id' => $restaurant->id,
            'menu_category_id' => $category->id,
            'is_available' => true,
        ]);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/orders', [
            'restaurant_id' => $restaurant->id,
            'delivery_latitude' => $restaurant->latitude,
            'delivery_longitude' => $restaurant->longitude,
            'delivery_address' => 'Address',
            'items' => [
                ['menu_item_id' => $item->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertDatabaseCount('orders', 1);
    }
}
