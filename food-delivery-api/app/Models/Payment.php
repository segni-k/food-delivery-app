<?php

namespace App\Models;

use App\Enums\PaymentStatusEnum;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory;
    use HasPublicUuid, SoftDeletes;

    protected $fillable = [
        'public_id',
        'order_id',
        'gateway',
        'gateway_transaction_ref',
        'gateway_reference',
        'amount',
        'currency',
        'status',
        'gateway_payload',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => PaymentStatusEnum::class,
            'amount' => 'decimal:2',
            'gateway_payload' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}



