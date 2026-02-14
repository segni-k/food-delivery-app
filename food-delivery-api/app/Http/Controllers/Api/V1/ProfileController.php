<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentCardRequest;
use App\Http\Requests\StoreUserAddressRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\PaymentCard;
use App\Models\UserAddress;
use App\Services\GeoLocationService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly GeoLocationService $geoLocationService)
    {
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['addresses', 'paymentCards']);

        return $this->successResponse('Profile fetched successfully.', new UserResource($user));
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return $this->successResponse('Profile updated successfully.', new UserResource($user->refresh()->load(['addresses', 'paymentCards'])));
    }

    public function storeAddress(StoreUserAddressRequest $request)
    {
        $user = $request->user();
        $payload = $request->validated();
        if (empty($payload['latitude']) || empty($payload['longitude'])) {
            $geocoded = $this->geoLocationService->geocodeAddress((string) $payload['address_line']);
            $payload['address_line'] = $geocoded['normalized_address'];
            $payload['latitude'] = $geocoded['latitude'];
            $payload['longitude'] = $geocoded['longitude'];
        }

        if (!empty($payload['is_default'])) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($payload);

        return $this->successResponse('Address added successfully.', [
            'id' => $address->public_id,
            'label' => $address->label,
            'address_line' => $address->address_line,
            'latitude' => $address->latitude,
            'longitude' => $address->longitude,
            'is_default' => $address->is_default,
        ], 201);
    }

    public function deleteAddress(Request $request, UserAddress $address)
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized address operation.');
        }

        $address->delete();

        return $this->successResponse('Address removed successfully.');
    }

    public function storePaymentCard(StorePaymentCardRequest $request)
    {
        $user = $request->user();
        $payload = $request->validated();

        if (!empty($payload['is_default'])) {
            $user->paymentCards()->update(['is_default' => false]);
        }

        $card = $user->paymentCards()->create($payload);

        return $this->successResponse('Payment card saved successfully.', [
            'id' => $card->public_id,
            'cardholder_name' => $card->cardholder_name,
            'brand' => $card->brand,
            'last4' => $card->last4,
            'exp_month' => $card->exp_month,
            'exp_year' => $card->exp_year,
            'is_default' => $card->is_default,
        ], 201);
    }

    public function deletePaymentCard(Request $request, PaymentCard $card)
    {
        if ($card->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized card operation.');
        }

        $card->delete();

        return $this->successResponse('Payment card removed successfully.');
    }
}
