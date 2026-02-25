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
use Throwable;

class RestaurantController extends Controller
{
    public function __construct(private readonly RestaurantService $restaurantService)
    {
    }

    public function index(Request $request)
    {
        $cacheKey = 'api:v1:restaurants:index:' . md5((string) $request->getQueryString());
        if ($this->shouldUseEndpointCache()) {
            $cached = $this->readCachedPayload($cacheKey);
            if ($cached !== null) {
                return response()->json($cached);
            }
        }

        $includeOwner = (bool) $request->boolean('include_owner', false);
        $restaurants = $this->restaurantService->listForApi(
            (int) $request->integer('per_page', 15),
            $includeOwner
        );
        $response = $this->successResponse('Restaurants fetched successfully.', RestaurantResource::collection($restaurants));

        if ($this->shouldUseEndpointCache()) {
            $this->writeCachedPayload($cacheKey, $response->getData(true), 30);
        }

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
        if ($this->shouldUseEndpointCache()) {
            $cached = $this->readCachedPayload($cacheKey);
            if ($cached !== null) {
                return response()->json($cached);
            }
        }

        $includeOwner = (bool) request()->boolean('include_owner', false);
        $response = $this->successResponse('Restaurant fetched successfully.', new RestaurantResource($restaurant->load([
            'featuredMenuItem',
            ...($includeOwner ? ['owner'] : []),
        ])));

        if ($this->shouldUseEndpointCache()) {
            $this->writeCachedPayload($cacheKey, $response->getData(true), 30);
        }

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

    private function readCachedPayload(string $key): ?array
    {
        try {
            $cached = Cache::get($key);
            return is_array($cached) ? $cached : null;
        } catch (Throwable) {
            return null;
        }
    }

    private function writeCachedPayload(string $key, array $payload, int $seconds): void
    {
        try {
            Cache::put($key, $payload, now()->addSeconds($seconds));
        } catch (Throwable) {
            // Cache is best-effort only. If cache backend fails, do not fail API responses.
        }
    }

    private function shouldUseEndpointCache(): bool
    {
        $driver = (string) config('cache.default');

        return in_array($driver, ['file', 'redis', 'memcached', 'array'], true);
    }
}
