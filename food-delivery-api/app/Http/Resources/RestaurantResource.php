<?php

namespace App\Http\Resources;

use App\Services\GeoLocationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $deliveryArea = app(GeoLocationService::class)->nearestCityName(
            (float) $this->latitude,
            (float) $this->longitude,
        );

        return [
            'id' => $this->public_id,
            'name' => $this->name,
            'description' => $this->description,
            'address' => $this->address,
            'image_url' => $this->normalizeImageUrl($this->image_url),
            'banner_image_url' => $this->normalizeImageUrl($this->banner_image_url),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'google_maps_url' => $this->latitude && $this->longitude
                ? sprintf('https://www.google.com/maps?q=%s,%s', $this->latitude, $this->longitude)
                : null,
            'delivery_radius_km' => $this->delivery_radius_km,
            'delivery_area' => $deliveryArea,
            'delivery_area_label' => sprintf('%s (up to %.2f km)', $deliveryArea, (float) $this->delivery_radius_km),
            'average_rating' => $this->average_rating,
            'is_active' => $this->is_active,
            'hero_image_url' => $this->normalizeImageUrl($this->banner_image_url)
                ?: $this->normalizeImageUrl($this->image_url)
                ?: $this->normalizeImageUrl($this->featuredMenuItem?->image_url),
            'owner' => UserResource::make($this->whenLoaded('owner')),
            'menu_categories' => MenuCategoryResource::collection($this->whenLoaded('menuCategories')),
            'menu_items' => MenuItemResource::collection($this->whenLoaded('menuItems')),
            'created_at' => $this->created_at,
        ];
    }

    private function normalizeImageUrl(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        $publicDiskUrl = rtrim((string) config('filesystems.disks.public.url', '/storage'), '/');

        return $publicDiskUrl.'/'.ltrim($value, '/');
    }
}
