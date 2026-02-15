# API v1 Examples

Base URL: `/api/v1`

## Register

`POST /auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password",
  "role": "customer"
}
```

Success response:

```json
{
  "success": true,
  "message": "Registered successfully.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe"
    },
    "token": "1|token"
  }
}
```

## Place Order

`POST /orders`

```json
{
  "restaurant_id": 1,
  "delivery_latitude": 9.03,
  "delivery_longitude": 38.74,
  "delivery_address": "Bole, Addis Ababa",
  "promo_code": "PROMO-1001",
  "items": [
    { "menu_item_id": 10, "quantity": 2 }
  ]
}
```

## Create Payment Intent

`POST /payments/intents`

```json
{
  "order_id": 1
}
```

## Standard Error Format

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "field": ["error"]
  }
}
```
