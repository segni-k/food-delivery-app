<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RestaurantFactory extends Factory
{
    private const CITY_CENTERS = [
        ['name' => 'Addis Ababa', 'latitude' => 9.03, 'longitude' => 38.74],
        ['name' => 'Harar', 'latitude' => 9.3126, 'longitude' => 42.1274],
        ['name' => 'Dire Dawa', 'latitude' => 9.6009, 'longitude' => 41.8501],
    ];

    public function definition(): array
    {
        $city = fake()->randomElement(self::CITY_CENTERS);
        $latOffset = fake()->randomFloat(4, -0.08, 0.08);
        $lngOffset = fake()->randomFloat(4, -0.08, 0.08);

        return [
            'public_id' => (string) Str::uuid(),
            'owner_id' => User::factory(),
            'name' => fake()->company() . ' Kitchen',
            'description' => fake()->sentence() . ' Fast delivery in ' . $city['name'] . '.',
            'address' => $city['name'] . ', Ethiopia',
            'image_url' => 'https://picsum.photos/seed/harereats-restaurant-' . Str::uuid() . '/1600/1000',
            'banner_image_url' => 'https://picsum.photos/seed/harereats-banner-' . Str::uuid() . '/1800/900',
            'latitude' => $city['latitude'] + $latOffset,
            'longitude' => $city['longitude'] + $lngOffset,
            'delivery_radius_km' => fake()->randomFloat(2, 3, 12),
            'average_rating' => fake()->randomFloat(2, 3.8, 5),
            'is_active' => true,
        ];
    }
}
