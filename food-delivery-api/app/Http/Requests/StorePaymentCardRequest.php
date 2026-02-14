<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cardholder_name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:50'],
            'last4' => ['required', 'digits:4'],
            'exp_month' => ['required', 'integer', 'between:1,12'],
            'exp_year' => ['required', 'integer', 'min:2024', 'max:2100'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
