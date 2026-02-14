<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'restaurant_id' => $this->restaurant?->public_id,
            'menu_category_id' => $this->category?->public_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'image_url' => $this->normalizeImageUrl($this->image_url),
            'is_available' => $this->is_available,
            'restaurant' => $this->whenLoaded('restaurant', fn (): array => [
                'id' => $this->restaurant?->public_id,
                'name' => $this->restaurant?->name,
                'image_url' => $this->normalizeImageUrl($this->restaurant?->image_url),
                'banner_image_url' => $this->normalizeImageUrl($this->restaurant?->banner_image_url),
            ]),
            'category' => new MenuCategoryResource($this->whenLoaded('category')),
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

        return Storage::disk('public')->url($value);
    }
}
