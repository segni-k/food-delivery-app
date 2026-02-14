<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRestaurantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['required', 'string', 'max:500'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'image' => ['nullable', 'image', 'max:10240'],
            'banner_image_url' => ['nullable', 'string', 'max:2048'],
            'banner_image' => ['nullable', 'image', 'max:10240'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'delivery_radius_km' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
