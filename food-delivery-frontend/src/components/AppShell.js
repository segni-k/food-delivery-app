import React, { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const navLinkClassName = ({ isActive }) =>
  `rounded-full border px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'border-orange-300 bg-[linear-gradient(135deg,#f97316_0%,#dc2626_100%)] text-white shadow-md shadow-orange-500/35'
      : 'border-transparent bg-white/60 text-neutral-700 hover:border-orange-200 hover:bg-orange-100/80 hover:text-orange-700 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-orange-300'
  }`;

const AppShell = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const cartItemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const role = user?.role;

  const navItems = useMemo(() => {
    const items = [];

    if (role === 'restaurant_owner') {
      items.push({ to: '/my-restaurant', label: 'My Restaurant' });
    } else {
      items.push({ to: '/restaurants', label: 'Restaurants' });
    }

    if (role === 'customer') {
      items.push({ to: '/orders', label: 'Orders' });
      items.push({ to: '/dashboard', label: 'Dashboard' });
    }

    if (role === 'delivery_partner') {
      items.push({ to: '/my-deliveries', label: 'My Deliveries' });
    }

    if (role === 'admin') {
      items.push({ to: '/admin', label: 'Admin' });
    }

    items.push({ to: '/profile', label: 'Profile' });

    return items;
  }, [role]);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate('/login', { replace: true });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#fffaf0_44%,#fff1f2_100%)] text-neutral-900 dark:bg-[linear-gradient(180deg,#1a0f0c_0%,#23130f_42%,#0f172a_100%)] dark:text-neutral-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_8%_8%,#fb923c_0%,transparent_26%),radial-gradient(circle_at_30%_2%,#f97316_0%,transparent_34%),radial-gradient(circle_at_56%_10%,#facc15_0%,transparent_28%),radial-gradient(circle_at_84%_8%,#dc2626_0%,transparent_33%),radial-gradient(circle_at_97%_20%,#16a34a_0%,transparent_24%)] opacity-90 dark:bg-[radial-gradient(circle_at_9%_8%,#ea580c_0%,transparent_26%),radial-gradient(circle_at_31%_1%,#f97316_0%,transparent_34%),radial-gradient(circle_at_56%_10%,#f59e0b_0%,transparent_28%),radial-gradient(circle_at_84%_8%,#ef4444_0%,transparent_33%),radial-gradient(circle_at_97%_20%,#22c55e_0%,transparent_24%)] dark:opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,0))] dark:bg-[linear-gradient(180deg,rgba(17,24,39,.45),rgba(17,24,39,0))]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 mb-8 rounded-2xl border border-orange-200/80 bg-white/84 p-3 shadow-xl shadow-orange-300/30 backdrop-blur-md md:top-3 dark:border-neutral-700 dark:bg-neutral-900/84 dark:shadow-black/45">
          <div className="flex items-center gap-3">
            <Link to="/restaurants" className="mr-1 flex items-center gap-2" onClick={closeMenu}>
              <BrandLogo />
            </Link>

            <nav className="hidden flex-1 items-center gap-2 overflow-x-auto py-1 md:flex">
              {navItems.map((item) => (
                <NavLink key={item.to} className={navLinkClassName} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto hidden items-center gap-2 md:flex">
              {role === 'customer' ? (
                <Link
                  to="/cart"
                  className="rounded-full border border-orange-300 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_100%)] px-4 py-2 text-sm font-semibold text-orange-700 transition hover:brightness-95 dark:border-orange-300/60 dark:bg-[linear-gradient(135deg,#ea580c_0%,#dc2626_55%,#16a34a_100%)] dark:text-white dark:shadow-lg dark:shadow-orange-900/40 dark:hover:brightness-110"
                >
                  Cart ({cartItemCount})
                </Link>
              ) : null}
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-orange-200 bg-white/80 text-neutral-800 transition hover:bg-orange-50 md:hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                {isMenuOpen ? (
                  <path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.4l-6.3 6.3-1.42-1.42L9.17 12l-6.3-6.29 1.42-1.42 6.3 6.3 6.29-6.3z" />
                ) : (
                  <path fill="currentColor" d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
                )}
              </svg>
            </button>
          </div>
        </header>

        {isMenuOpen ? (
          <div className="fixed inset-0 z-20 bg-neutral-900/45 backdrop-blur-[1px] md:hidden" onClick={closeMenu} aria-hidden="true" />
        ) : null}

        <aside
          id="mobile-nav"
          className={`fixed right-3 top-16 z-30 w-[min(22rem,calc(100%-1.5rem))] rounded-2xl border border-orange-200/80 bg-white p-4 shadow-2xl transition md:hidden dark:border-neutral-700 dark:bg-neutral-900 ${
            isMenuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
          }`}
        >
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={`mobile-${item.to}`}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,#f97316_0%,#dc2626_100%)] text-white'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-orange-100 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700'
                  }`
                }
                to={item.to}
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            {role === 'customer' ? (
              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex-1 rounded-xl border border-orange-300 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_100%)] px-3 py-2 text-center text-sm font-semibold text-orange-700 dark:border-orange-300/60 dark:bg-[linear-gradient(135deg,#ea580c_0%,#dc2626_55%,#16a34a_100%)] dark:text-white dark:shadow-lg dark:shadow-orange-900/40"
              >
                Cart ({cartItemCount})
              </Link>
            ) : null}
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="mt-3 w-full rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </aside>

        <section className="mb-6 rounded-2xl border border-orange-100/70 bg-white/62 px-4 py-4 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/58 sm:px-5">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-700 dark:text-neutral-300">{subtitle}</p>
          {user ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-orange-700 dark:text-orange-300">
              Signed in as {user.name}
            </p>
          ) : null}
        </section>

        {children}
      </div>
    </main>
  );
};

export default AppShell;
