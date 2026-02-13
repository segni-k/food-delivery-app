<?php

namespace App\Enums;

enum DeliveryAssignmentStatusEnum: string
{
    case ASSIGNED = 'assigned';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';
    case IN_TRANSIT = 'in_transit';
    case COMPLETED = 'completed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
