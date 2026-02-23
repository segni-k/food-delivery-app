<?php

namespace Tests\Feature;

use App\Enums\UserRoleEnum;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MenuItemFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_menu_item_with_image_upload(): void
    {
        Storage::fake('public');

        $owner = User::factory()->create(['role' => UserRoleEnum::RESTAURANT_OWNER]);
        $restaurant = Restaurant::factory()->create(['owner_id' => $owner->id]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);

        Sanctum::actingAs($owner);

        $response = $this->post('/api/v1/restaurants/' . $restaurant->public_id . '/items', [
            'menu_category_id' => $category->public_id,
            'name' => 'Special Tibs',
            'description' => 'Spicy beef with onions and peppers.',
            'price' => '19.99',
            'is_available' => '1',
            'image' => UploadedFile::fake()->create('special-tibs.jpg', 128, 'image/jpeg'),
        ]);

        $response->assertCreated()->assertJsonPath('success', true);

        $item = MenuItem::query()->where('public_id', $response->json('data.id'))->firstOrFail();
        $this->assertNotNull($item->image_url);
        Storage::disk('public')->assertExists($item->image_url);
    }
}
