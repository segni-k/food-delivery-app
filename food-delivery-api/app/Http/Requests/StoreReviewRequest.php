<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'string'],
            'restaurant_rating' => ['required', 'integer', 'between:1,5'],
            'delivery_rating' => ['nullable', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string'],
        ];
    }
}
