import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';

const roleTitles = {
  restaurants: 'Customer Restaurants',
  'my-restaurant': 'Restaurant Owner Dashboard',
  'my-deliveries': 'Delivery Partner Dashboard',
};

const DashboardStubPage = ({ slug }) => {
  return (
    <AppShell
      title={roleTitles[slug]}
      subtitle="This role-specific area is still under construction. Customer browsing and cart flows are production-ready."
    >
      <section className="rounded-2xl border border-dashed border-neutral-300 bg-white/90 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/90">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Continue to customer view while these modules are being built.</p>
        <Link
          to="/restaurants"
          className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Open restaurants
        </Link>
      </section>
    </AppShell>
  );
};

export default DashboardStubPage;
