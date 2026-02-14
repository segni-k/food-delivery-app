<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRestaurantRequest;
use App\Http\Requests\UpdateRestaurantRequest;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Services\RestaurantService;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function __construct(private readonly RestaurantService $restaurantService)
    {
    }

    public function index(Request $request)
    {
        $restaurants = $this->restaurantService->listForApi((int) $request->integer('per_page', 15));

        return $this->successResponse('Restaurants fetched successfully.', RestaurantResource::collection($restaurants));
    }

    public function store(StoreRestaurantRequest $request)
    {
        $payload = $request->validated();
        $payload['image'] = $request->file('image');
        $payload['banner_image'] = $request->file('banner_image');
        $restaurant = $this->restaurantService->create($request->user(), $payload);

        return $this->successResponse('Restaurant created successfully.', new RestaurantResource($restaurant), 201);
    }

    public function show(Restaurant $restaurant)
    {
        return $this->successResponse('Restaurant fetched successfully.', new RestaurantResource($restaurant->load([
            'owner',
            'featuredMenuItem',
            'menuCategories.menuItems',
            'menuItems',
        ])));
    }

    public function update(UpdateRestaurantRequest $request, Restaurant $restaurant)
    {
        $this->authorize('update', $restaurant);

        $payload = $request->validated();
        $payload['image'] = $request->file('image');
        $payload['banner_image'] = $request->file('banner_image');
        $restaurant = $this->restaurantService->update($restaurant, $payload);

        return $this->successResponse('Restaurant updated successfully.', new RestaurantResource($restaurant));
    }
}
