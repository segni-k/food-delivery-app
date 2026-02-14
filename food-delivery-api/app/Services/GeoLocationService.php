<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeoLocationService
{
    private const CITY_REFERENCE_POINTS = [
        [
            'name' => 'Addis Ababa',
            'latitude' => 9.03,
            'longitude' => 38.74,
        ],
        [
            'name' => 'Harar',
            'latitude' => 9.3126,
            'longitude' => 42.1274,
        ],
        [
            'name' => 'Dire Dawa',
            'latitude' => 9.6009,
            'longitude' => 41.8501,
        ],
    ];

    public function calculateDistanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadiusKm = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadiusKm * $c;
    }

    public function ensureInDeliveryRadius(float $customerLat, float $customerLng, float $restaurantLat, float $restaurantLng, float $radiusKm): void
    {
        $distance = $this->calculateDistanceKm($customerLat, $customerLng, $restaurantLat, $restaurantLng);

        if ($distance > $radiusKm) {
            abort(422, 'Delivery address is outside the restaurant delivery zone.');
        }
    }

    public function nearestCityName(float $latitude, float $longitude): string
    {
        $closest = collect(self::CITY_REFERENCE_POINTS)
            ->map(function (array $city) use ($latitude, $longitude): array {
                $distanceKm = $this->calculateDistanceKm(
                    $latitude,
                    $longitude,
                    (float) $city['latitude'],
                    (float) $city['longitude'],
                );

                return [
                    ...$city,
                    'distance_km' => $distanceKm,
                ];
            })
            ->sortBy('distance_km')
            ->first();

        return (string) ($closest['name'] ?? 'your area');
    }

    public function estimateEtaMinutes(float $distanceKm): int
    {
        // Practical baseline for mixed city traffic: handling + pickup + route time.
        return max(12, (int) round(($distanceKm * 4.2) + 10));
    }

    public function estimateDeliveryFee(float $distanceKm): float
    {
        // Distance-weighted fee with a minimum base charge.
        return round(max(1.5, 2 + ($distanceKm * 0.8)), 2);
    }

    public function routeEfficiencyScore(float $distanceKm, float $radiusKm): int
    {
        if ($radiusKm <= 0) {
            return 0;
        }

        $utilization = min(1, $distanceKm / $radiusKm);
        $score = 100 - ($utilization * 70);

        return (int) max(0, min(100, round($score)));
    }

    public function geocodeAddress(string $address): array
    {
        $query = trim($address);
        if ($query === '') {
            abort(422, 'Address is required.');
        }

        $response = Http::timeout(10)
            ->withHeaders(['Accept' => 'application/json'])
            ->get('https://nominatim.openstreetmap.org/search', [
                'format' => 'jsonv2',
                'q' => $query,
                'limit' => 1,
            ]);

        if (! $response->ok()) {
            abort(422, 'Unable to validate the address right now. Please try again.');
        }

        $rows = $response->json();
        if (! is_array($rows) || empty($rows)) {
            abort(422, 'Address not found. Please provide a more specific address.');
        }

        return [
            'latitude' => (float) data_get($rows, '0.lat'),
            'longitude' => (float) data_get($rows, '0.lon'),
            'normalized_address' => (string) (data_get($rows, '0.display_name') ?: $query),
        ];
    }
}
