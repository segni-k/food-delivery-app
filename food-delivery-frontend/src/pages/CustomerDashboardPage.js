import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Card, CardBody, CardHeader, CardTitle, Chart } from '../components/ui';

const sampleOrderTrend = [
  { day: 'Mon', orders: 2 },
  { day: 'Tue', orders: 4 },
  { day: 'Wed', orders: 3 },
  { day: 'Thu', orders: 5 },
  { day: 'Fri', orders: 6 },
  { day: 'Sat', orders: 4 },
  { day: 'Sun', orders: 3 },
];

const CustomerDashboardPage = () => (
  <AppShell
    title="Customer dashboard"
    subtitle="Quick access to restaurants, cart, orders, and checkout."
  >
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { to: '/restaurants', title: 'Browse restaurants', subtitle: 'Find dishes and add to cart.' },
        { to: '/cart', title: 'Cart', subtitle: 'Review selected items.' },
        { to: '/orders', title: 'Orders', subtitle: 'Track order status timeline.' },
        { to: '/checkout', title: 'Checkout', subtitle: 'Complete your current order.' },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <h2 className="text-base font-bold">{item.title}</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{item.subtitle}</p>
        </Link>
      ))}
    </section>

    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Weekly order activity</CardTitle>
      </CardHeader>
      <CardBody>
        <Chart data={sampleOrderTrend} xKey="day" yKeys={['orders']} type="line" height={260} />
      </CardBody>
    </Card>
  </AppShell>
);

export default CustomerDashboardPage;

