<?php

namespace App\Providers;

use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use App\Policies\MenuCategoryPolicy;
use App\Policies\MenuItemPolicy;
use App\Policies\OrderPolicy;
use App\Policies\RestaurantPolicy;
use App\Policies\ReviewPolicy;
use App\Services\Contracts\PaymentGatewayInterface;
use App\Services\Gateways\ChapaPaymentGateway;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Listeners\AssignDeliveryPartnerListener;
use App\Listeners\ProcessPaymentListener;
use App\Listeners\SendOrderNotificationListener;
use App\Listeners\UpdateAnalyticsListener;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, ChapaPaymentGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Restaurant::class, RestaurantPolicy::class);
        Gate::policy(MenuCategory::class, MenuCategoryPolicy::class);
        Gate::policy(MenuItem::class, MenuItemPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Review::class, ReviewPolicy::class);

        Event::listen(OrderCreated::class, SendOrderNotificationListener::class);
        Event::listen(OrderCreated::class, AssignDeliveryPartnerListener::class);
        Event::listen(OrderCreated::class, ProcessPaymentListener::class);
        Event::listen(OrderStatusUpdated::class, UpdateAnalyticsListener::class);
    }
}
