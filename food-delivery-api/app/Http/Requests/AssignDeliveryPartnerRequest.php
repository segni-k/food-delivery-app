<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignDeliveryPartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_partner_id' => ['required', 'string'],
            'estimated_eta_minutes' => ['nullable', 'integer', 'min:5', 'max:180'],
        ];
    }
}

