import React from 'react';
import AppShell from '../components/AppShell';
import { Card, CardBody, CardHeader, CardTitle, Chart } from '../components/ui';

const revenueData = [
  { month: 'Jan', revenue: 1200, orders: 75 },
  { month: 'Feb', revenue: 1800, orders: 92 },
  { month: 'Mar', revenue: 2100, orders: 110 },
  { month: 'Apr', revenue: 2400, orders: 122 },
  { month: 'May', revenue: 2300, orders: 117 },
  { month: 'Jun', revenue: 2600, orders: 130 },
];

const AdminDashboardPage = () => (
  <AppShell title="Admin dashboard" subtitle="Administrative overview and platform operations.">
    <section className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue trend</CardTitle>
        </CardHeader>
        <CardBody>
          <Chart data={revenueData} xKey="month" yKeys={['revenue']} type="area" height={260} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order volume</CardTitle>
        </CardHeader>
        <CardBody>
          <Chart data={revenueData} xKey="month" yKeys={['orders']} type="bar" height={260} />
        </CardBody>
      </Card>
    </section>
  </AppShell>
);

export default AdminDashboardPage;

