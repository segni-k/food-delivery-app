<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentCard extends Model
{
    use HasFactory;
    use HasPublicUuid;

    protected $fillable = [
        'public_id',
        'user_id',
        'cardholder_name',
        'brand',
        'last4',
        'exp_month',
        'exp_year',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
