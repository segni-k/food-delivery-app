<?php

namespace App\Models;

use App\Enums\DeliveryAssignmentStatusEnum;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryAssignment extends Model
{
    use HasFactory;
    use HasPublicUuid;

    protected $fillable = [
        'public_id',
        'order_id',
        'delivery_partner_id',
        'status',
        'estimated_eta_minutes',
        'accepted_at',
        'rejected_at',
        'picked_up_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => DeliveryAssignmentStatusEnum::class,
            'accepted_at' => 'datetime',
            'rejected_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function deliveryPartner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivery_partner_id');
    }
}



