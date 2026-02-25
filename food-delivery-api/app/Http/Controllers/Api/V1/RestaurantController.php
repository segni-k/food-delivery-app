<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRestaurantRequest;
use App\Http\Requests\UpdateRestaurantRequest;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Services\RestaurantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RestaurantController extends Controller
{
    public function __construct(private readonly RestaurantService $restaurantService)
    {
    }

    public function index(Request $request)
    {
        $cacheKey = 'api:v1:restaurants:index:' . md5((string) $request->getQueryString());
        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return response()->json($cached);
        }

        $restaurants = $this->restaurantService->listForApi((int) $request->integer('per_page', 15));
        $response = $this->successResponse('Restaurants fetched successfully.', RestaurantResource::collection($restaurants));

        Cache::put($cacheKey, $response->getData(true), now()->addSeconds(30));

        return $response;
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
        $cacheKey = 'api:v1:restaurants:show:' . $restaurant->public_id;
        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return response()->json($cached);
        }

        $response = $this->successResponse('Restaurant fetched successfully.', new RestaurantResource($restaurant->load([
            'owner',
            'featuredMenuItem',
        ])));

        Cache::put($cacheKey, $response->getData(true), now()->addSeconds(30));

        return $response;
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
