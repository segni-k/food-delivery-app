<?php

namespace App\Enums;

enum PromoCodeTypeEnum: string
{
    case PERCENTAGE = 'percentage';
    case FIXED = 'fixed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
