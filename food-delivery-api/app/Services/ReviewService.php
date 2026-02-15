<?php

namespace App\Services;

use App\Models\Review;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function create(array $payload): Review
    {
        return DB::transaction(function () use ($payload): Review {
            $review = Review::query()->create($payload);

            $restaurantAvg = Review::query()
                ->where('restaurant_id', $review->restaurant_id)
                ->avg('restaurant_rating');

            $review->restaurant()->update(['average_rating' => round((float) $restaurantAvg, 2)]);

            if ($review->delivery_partner_id) {
                $deliveryAvg = Review::query()
                    ->where('delivery_partner_id', $review->delivery_partner_id)
                    ->whereNotNull('delivery_rating')
                    ->avg('delivery_rating');

                $review->deliveryPartner()->update(['average_rating' => round((float) $deliveryAvg, 2)]);
            }

            return $review->refresh();
        });
    }
}
