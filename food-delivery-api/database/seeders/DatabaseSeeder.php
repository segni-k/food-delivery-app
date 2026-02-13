<?php

namespace Database\Seeders;

use App\Enums\DeliveryAssignmentStatusEnum;
use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PromoCode;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->create([
            'name' => 'Admin User',
            'email' => 'admin@fooddelivery.test',
            'phone' => '+251900000001',
            'role' => UserRoleEnum::ADMIN,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        User::query()->create([
            'name' => 'Support User',
            'email' => 'support@fooddelivery.test',
            'phone' => '+251900000002',
            'role' => UserRoleEnum::SUPPORT,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        User::query()->create([
            'name' => 'Finance User',
            'email' => 'finance@fooddelivery.test',
            'phone' => '+251900000003',
            'role' => UserRoleEnum::FINANCE,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        User::query()->create([
            'name' => 'Operations User',
            'email' => 'operations@fooddelivery.test',
            'phone' => '+251900000004',
            'role' => UserRoleEnum::OPERATIONS,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $owners = User::factory()->count(5)->create(['role' => UserRoleEnum::RESTAURANT_OWNER]);
        $customers = User::factory()->count(10)->create(['role' => UserRoleEnum::CUSTOMER]);
        $deliveryPartners = User::factory()->count(10)->create([
            'role' => UserRoleEnum::DELIVERY_PARTNER,
            'is_available_for_delivery' => true,
        ]);

        $restaurants = collect();
        foreach ($owners as $owner) {
            $restaurants->push(Restaurant::factory()->create(['owner_id' => $owner->id]));
        }

        // Add a few extra restaurants to make browsing data richer.
        for ($index = 0; $index < 3; $index++) {
            $restaurants->push(Restaurant::factory()->create([
                'owner_id' => $owners->random()->id,
            ]));
        }

        foreach ($restaurants as $restaurant) {
            $categories = MenuCategory::factory()->count(3)->create(['restaurant_id' => $restaurant->id]);
            foreach ($categories as $category) {
                MenuItem::factory()->count(5)->create([
                    'restaurant_id' => $restaurant->id,
                    'menu_category_id' => $category->id,
                ]);
            }
        }

        PromoCode::factory()->count(5)->create();

        $restaurants->each(function (Restaurant $restaurant) use ($customers, $deliveryPartners): void {
            $customer = $customers->random();
            $items = MenuItem::query()->where('restaurant_id', $restaurant->id)->inRandomOrder()->limit(3)->get();
            $subtotal = $items->sum('price');

            $order = Order::query()->create([
                'customer_id' => $customer->id,
                'restaurant_id' => $restaurant->id,
                'status' => OrderStatusEnum::DELIVERED,
                'subtotal_amount' => $subtotal,
                'delivery_fee' => 5,
                'discount_amount' => 0,
                'total_amount' => $subtotal + 5,
                'delivery_latitude' => $customer->latitude,
                'delivery_longitude' => $customer->longitude,
                'delivery_address' => 'Sample delivery address',
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'menu_item_id' => $item->id,
                    'quantity' => 1,
                    'unit_price' => $item->price,
                    'total_price' => $item->price,
                ]);
            }

            $assignment = $order->deliveryAssignments()->create([
                'delivery_partner_id' => $deliveryPartners->random()->id,
                'status' => DeliveryAssignmentStatusEnum::COMPLETED,
                'estimated_eta_minutes' => 30,
                'accepted_at' => now()->subMinutes(40),
                'picked_up_at' => now()->subMinutes(25),
                'delivered_at' => now()->subMinutes(5),
            ]);

            Payment::query()->create([
                'order_id' => $order->id,
                'gateway' => 'chapa',
                'gateway_transaction_ref' => 'FD-SEED-' . $order->id,
                'amount' => $order->total_amount,
                'currency' => 'ETB',
                'status' => PaymentStatusEnum::PAID,
                'paid_at' => now()->subMinutes(45),
            ]);

            $order->review()->create([
                'customer_id' => $customer->id,
                'restaurant_id' => $restaurant->id,
                'delivery_partner_id' => $assignment->delivery_partner_id,
                'restaurant_rating' => fake()->numberBetween(4, 5),
                'delivery_rating' => fake()->numberBetween(4, 5),
                'comment' => fake()->sentence(),
            ]);
        });

        // Ensure media URLs are unique and image-direct across restaurants and menu items.
        Restaurant::query()->get()->each(function (Restaurant $restaurant): void {
            $restaurant->update([
                'image_url' => 'https://picsum.photos/seed/harereats-restaurant-' . Str::uuid() . '/1600/1000',
                'banner_image_url' => 'https://picsum.photos/seed/harereats-banner-' . Str::uuid() . '/1800/900',
            ]);
        });

        MenuItem::query()->get()->each(function (MenuItem $item): void {
            $item->update([
                'image_url' => 'https://picsum.photos/seed/harereats-food-' . Str::uuid() . '/1200/900',
            ]);
        });

        $admin->update(['is_available_for_delivery' => false]);
    }
}
