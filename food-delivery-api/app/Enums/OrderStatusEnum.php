<?php

namespace App\Enums;

enum OrderStatusEnum: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case PREPARING = 'preparing';
    case READY = 'ready';
    case PICKED_UP = 'picked_up';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    public function canTransitionTo(self $to): bool
    {
        return match ($this) {
            self::PENDING => in_array($to, [self::ACCEPTED, self::CANCELLED], true),
            self::ACCEPTED => in_array($to, [self::PREPARING, self::CANCELLED], true),
            self::PREPARING => in_array($to, [self::READY, self::CANCELLED], true),
            self::READY => $to === self::PICKED_UP,
            self::PICKED_UP => $to === self::DELIVERED,
            self::DELIVERED, self::CANCELLED => false,
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
