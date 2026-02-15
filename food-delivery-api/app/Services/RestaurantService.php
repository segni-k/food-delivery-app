<?php

namespace App\Services;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RestaurantService
{
    public function __construct(
        private readonly GeoLocationService $geoLocationService,
        private readonly ImageUploadService $imageUploadService,
    )
    {
    }

    public function listForApi(int $perPage = 15): LengthAwarePaginator
    {
        return Restaurant::query()
            ->with(['owner', 'featuredMenuItem'])
            ->latest()
            ->paginate($perPage);
    }

    public function create(User $owner, array $data): Restaurant
    {
        $payload = $this->hydrateImageUrl($data);

        return Restaurant::query()->create([
            ...$payload,
            'owner_id' => $owner->id,
        ]);
    }

    public function update(Restaurant $restaurant, array $data): Restaurant
    {
        $restaurant->update($this->hydrateImageUrl($data));

        return $restaurant->refresh();
    }

    private function hydrateImageUrl(array $data): array
    {
        $payload = $data;

        if (! empty($payload['address'])) {
            $geocoded = $this->geoLocationService->geocodeAddress((string) $payload['address']);
            $payload['address'] = $geocoded['normalized_address'];
            $payload['latitude'] = $geocoded['latitude'];
            $payload['longitude'] = $geocoded['longitude'];
        }

        if (isset($payload['image']) && $payload['image']) {
            $path = $this->imageUploadService->storeCompressed($payload['image'], 'restaurants');
            $payload['image_url'] = $path;
            unset($payload['image']);
        }

        if (isset($payload['banner_image']) && $payload['banner_image']) {
            $path = $this->imageUploadService->storeCompressed($payload['banner_image'], 'restaurant-banners');
            $payload['banner_image_url'] = $path;
            unset($payload['banner_image']);
        }

        return $payload;
    }
}
