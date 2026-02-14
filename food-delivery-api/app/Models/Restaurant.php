<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use App\Services\GeoLocationService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Restaurant extends Model
{
    use HasFactory;
    use HasPublicUuid, SoftDeletes;

    protected $fillable = [
        'public_id',
        'owner_id',
        'name',
        'description',
        'address',
        'image_url',
        'banner_image_url',
        'latitude',
        'longitude',
        'delivery_radius_km',
        'average_rating',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'delivery_radius_km' => 'decimal:2',
            'average_rating' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Restaurant $restaurant): void {
            if (! $restaurant->address) {
                return;
            }

            if ($restaurant->isDirty('address') && (! $restaurant->latitude || ! $restaurant->longitude)) {
                $geo = app(GeoLocationService::class)->geocodeAddress((string) $restaurant->address);
                $restaurant->address = $geo['normalized_address'];
                $restaurant->latitude = $geo['latitude'];
                $restaurant->longitude = $geo['longitude'];
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function menuCategories(): HasMany
    {
        return $this->hasMany(MenuCategory::class);
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function featuredMenuItem(): HasOne
    {
        return $this->hasOne(MenuItem::class)->whereNotNull('image_url')->oldestOfMany('id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}



