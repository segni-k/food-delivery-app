import React from 'react';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#fffaf0_44%,#fff1f2_100%)] px-4 py-8 text-slate-900 dark:bg-[linear-gradient(180deg,#140f0c_0%,#1f1712_44%,#1f2937_100%)] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_6%_10%,#fb923c_0%,transparent_28%),radial-gradient(circle_at_28%_2%,#f97316_0%,transparent_36%),radial-gradient(circle_at_52%_8%,#facc15_0%,transparent_30%),radial-gradient(circle_at_80%_6%,#dc2626_0%,transparent_34%),radial-gradient(circle_at_95%_22%,#16a34a_0%,transparent_24%)] opacity-90 dark:bg-[radial-gradient(circle_at_6%_10%,#7c2d12_0%,transparent_28%),radial-gradient(circle_at_28%_2%,#9a3412_0%,transparent_36%),radial-gradient(circle_at_52%_8%,#713f12_0%,transparent_30%),radial-gradient(circle_at_80%_6%,#7f1d1d_0%,transparent_34%),radial-gradient(circle_at_95%_22%,#14532d_0%,transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,0))] dark:bg-[linear-gradient(180deg,rgba(17,24,39,.45),rgba(17,24,39,0))]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-stretch">
        <section className="w-full rounded-3xl border border-orange-100 bg-white/95 p-6 shadow-xl shadow-orange-100/50 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95 dark:shadow-black/20 lg:w-5/12 lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <BrandLogo />
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
            </div>
            <ThemeToggle />
          </div>
          {children}
        </section>

        <aside className="hidden flex-1 rounded-3xl bg-[linear-gradient(140deg,#f97316_0%,#ef4444_55%,#111827_100%)] p-8 text-white shadow-2xl shadow-orange-400/25 lg:block">
          <h2 className="text-3xl font-black leading-tight">Fast delivery with premium ordering UX.</h2>
          <p className="mt-4 text-sm leading-6 text-orange-50/95">
            Inspired by the best parts of food delivery marketplaces: clean cards, high-contrast actions, and bold navigation that works on every screen.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs font-semibold uppercase tracking-wide">
            <div className="rounded-xl bg-white/20 px-4 py-3 backdrop-blur">Smart discovery</div>
            <div className="rounded-xl bg-white/20 px-4 py-3 backdrop-blur">Quick checkout</div>
            <div className="rounded-xl bg-white/20 px-4 py-3 backdrop-blur">Live availability</div>
            <div className="rounded-xl bg-white/20 px-4 py-3 backdrop-blur">Role based access</div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default AuthLayout;
