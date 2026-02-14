<?php

namespace App\Models;

use App\Enums\OrderStatusEnum;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory;
    use HasPublicUuid, SoftDeletes;

    protected $fillable = [
        'public_id',
        'customer_id',
        'restaurant_id',
        'promo_code_id',
        'status',
        'subtotal_amount',
        'delivery_fee',
        'discount_amount',
        'total_amount',
        'delivery_latitude',
        'delivery_longitude',
        'delivery_address',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatusEnum::class,
            'subtotal_amount' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'delivery_latitude' => 'decimal:7',
            'delivery_longitude' => 'decimal:7',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function deliveryAssignments(): HasMany
    {
        return $this->hasMany(DeliveryAssignment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }
}



