import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';
import { useAuthStore } from '../store/authStore';
import { restaurantService } from '../services/restaurantService';

const LANDING_RESTAURANT_PHOTOS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1600&q=80',
];

const LandingPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);

  useEffect(() => {
    let isActive = true;

    const fetchRestaurants = async () => {
      try {
        const result = await restaurantService.getRestaurants({ per_page: 6 });
        if (!isActive) {
          return;
        }
        setFeaturedRestaurants(result.rows || []);
      } catch (_error) {
        if (!isActive) {
          return;
        }
        setFeaturedRestaurants([]);
      }
    };

    fetchRestaurants();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#fffaf0_44%,#fff1f2_100%)] text-neutral-900 dark:bg-[linear-gradient(180deg,#140f0c_0%,#1f1712_44%,#1f2937_100%)] dark:text-neutral-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_8%_8%,#fb923c_0%,transparent_28%),radial-gradient(circle_at_26%_1%,#f97316_0%,transparent_36%),radial-gradient(circle_at_52%_9%,#facc15_0%,transparent_30%),radial-gradient(circle_at_82%_6%,#dc2626_0%,transparent_34%),radial-gradient(circle_at_96%_20%,#16a34a_0%,transparent_24%)] opacity-90 dark:bg-[radial-gradient(circle_at_8%_8%,#7c2d12_0%,transparent_28%),radial-gradient(circle_at_26%_1%,#9a3412_0%,transparent_36%),radial-gradient(circle_at_52%_9%,#713f12_0%,transparent_30%),radial-gradient(circle_at_82%_6%,#7f1d1d_0%,transparent_34%),radial-gradient(circle_at_96%_20%,#14532d_0%,transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0))] dark:bg-[linear-gradient(180deg,rgba(17,24,39,.45),rgba(17,24,39,0))]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-30 mb-8 rounded-2xl border border-orange-100 bg-white/90 p-3 shadow-lg shadow-orange-100/40 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo />
            <nav className="ml-auto flex items-center gap-2 overflow-x-auto text-sm">
              <a href="#features" className="rounded-full px-3 py-2 font-semibold text-neutral-600 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-neutral-800">Features</a>
              <a href="#how" className="rounded-full px-3 py-2 font-semibold text-neutral-600 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-neutral-800">How It Works</a>
              <a href="#restaurants" className="rounded-full px-3 py-2 font-semibold text-neutral-600 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-neutral-800">Restaurants</a>
              <a href="#join" className="rounded-full px-3 py-2 font-semibold text-neutral-600 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-neutral-800">Join</a>
            </nav>
            <Link to="/login" className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
              Sign in
            </Link>
            <Link to="/register" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
              Sign up
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="grid items-stretch gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-xl shadow-orange-100/50 dark:border-neutral-700 dark:bg-neutral-900/90 lg:p-10">
            <p className="inline-flex rounded-full bg-orange-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
              HarerEats
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              Food delivery made simple, fast, and reliable.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-neutral-600 dark:text-neutral-300">
              Discover restaurants, order in minutes, and track your delivery from checkout to your door with a clean, customer-first experience.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated && user?.role === 'customer' ? '/dashboard' : '/login'}
                className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Customer dashboard
              </Link>
              <Link
                to="/restaurants"
                className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Browse restaurants
              </Link>
            </div>
          </article>

          <aside className="overflow-hidden rounded-3xl border border-orange-100 bg-white/90 p-4 shadow-xl shadow-orange-100/40 dark:border-neutral-700 dark:bg-neutral-900/90">
            <img
              src={LANDING_RESTAURANT_PHOTOS[0]}
              alt={featuredRestaurants[0]?.name || 'Featured restaurant'}
              className="h-60 w-full rounded-2xl object-cover"
              loading="lazy"
            />
            <div className="mt-4 rounded-2xl bg-[linear-gradient(145deg,#fb923c_0%,#ef4444_60%,#0f172a_100%)] p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-100">Live now</p>
              <p className="mt-1 text-2xl font-black">{featuredRestaurants[0]?.name || 'Top local kitchen'}</p>
              <p className="mt-1 text-sm text-orange-50">
                {featuredRestaurants[0]?.delivery_area_label || 'Serving your nearby area with fast delivery.'}
              </p>
            </div>
          </aside>
        </section>

        <section id="features" className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-orange-100 bg-white/90 p-5 dark:border-neutral-700 dark:bg-neutral-900/90">
            <h2 className="text-lg font-bold">Quick Ordering</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Find meals fast and checkout with delivery validation in a few clicks.</p>
          </article>
          <article className="rounded-2xl border border-orange-100 bg-white/90 p-5 dark:border-neutral-700 dark:bg-neutral-900/90">
            <h2 className="text-lg font-bold">Trusted Restaurants</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Restaurant owners can update menu and photos directly from backend tools.</p>
          </article>
          <article className="rounded-2xl border border-orange-100 bg-white/90 p-5 dark:border-neutral-700 dark:bg-neutral-900/90">
            <h2 className="text-lg font-bold">Reliable Delivery</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Zone checks, ETA preview, and route data help improve delivery efficiency.</p>
          </article>
        </section>

        <section id="how" className="mt-10 rounded-3xl border border-orange-100 bg-white/90 p-6 dark:border-neutral-700 dark:bg-neutral-900/90 lg:p-8">
          <h2 className="text-2xl font-black">How HarerEats works</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Step 1</p>
              <p className="mt-2 text-sm font-semibold">Choose restaurant</p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Step 2</p>
              <p className="mt-2 text-sm font-semibold">Add meals to cart</p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Step 3</p>
              <p className="mt-2 text-sm font-semibold">Checkout and track</p>
            </div>
          </div>
        </section>

        <section id="restaurants" className="mt-10">
          <h2 className="text-2xl font-black">Popular Restaurants</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(featuredRestaurants.length ? featuredRestaurants.slice(0, 6) : Array.from({ length: 6 })).map((restaurant, index) => (
              <Link
                key={restaurant?.id || `landing-restaurant-${index}`}
                to={restaurant?.id ? `/restaurants/${restaurant.id}` : '/restaurants'}
                className="overflow-hidden rounded-2xl border border-orange-100 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900/90"
              >
                {restaurant?.hero_image_url || restaurant?.image_url ? (
                  <img
                    src={LANDING_RESTAURANT_PHOTOS[index % LANDING_RESTAURANT_PHOTOS.length]}
                    alt={restaurant?.name || 'Restaurant'}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={LANDING_RESTAURANT_PHOTOS[index % LANDING_RESTAURANT_PHOTOS.length]}
                    alt={restaurant?.name || 'Restaurant'}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <p className="text-base font-bold">{restaurant?.name || 'Restaurant'}</p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {restaurant?.delivery_area_label || 'Serving nearby delivery zones'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="join" className="mt-10 rounded-3xl bg-[linear-gradient(145deg,#fb923c_0%,#ef4444_55%,#111827_100%)] p-6 text-white lg:p-8">
          <h2 className="text-2xl font-black">Ready to order with HarerEats?</h2>
          <p className="mt-2 text-sm text-orange-50">Create your account and start ordering from top local restaurants today.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100">
              Create account
            </Link>
            <Link to="/login" className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LandingPage;
