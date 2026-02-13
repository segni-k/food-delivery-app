<?php

namespace App\Enums;

enum UserRoleEnum: string
{
    case CUSTOMER = 'customer';
    case RESTAURANT_OWNER = 'restaurant_owner';
    case DELIVERY_PARTNER = 'delivery_partner';
    case ADMIN = 'admin';
    case SUPPORT = 'support';
    case FINANCE = 'finance';
    case OPERATIONS = 'operations';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function staffPanelRoles(): array
    {
        return [
            self::ADMIN->value,
            self::SUPPORT->value,
            self::FINANCE->value,
            self::OPERATIONS->value,
        ];
    }
}
