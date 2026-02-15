import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const palette = ['#f97316', '#ef4444', '#0ea5e9', '#22c55e', '#a855f7', '#eab308'];

const renderSeries = (type, yKeys = []) =>
  yKeys.map((key, index) => {
    const color = palette[index % palette.length];

    if (type === 'bar') {
      return <Bar key={`series-${key}`} dataKey={key} fill={color} radius={[6, 6, 0, 0]} />;
    }

    if (type === 'area') {
      return (
        <Area
          key={`series-${key}`}
          type="monotone"
          dataKey={key}
          stroke={color}
          fill={color}
          fillOpacity={0.18}
          strokeWidth={2}
        />
      );
    }

    return <Line key={`series-${key}`} type="monotone" dataKey={key} stroke={color} strokeWidth={2.5} dot={false} />;
  });

const Chart = ({
  data = [],
  xKey = 'name',
  yKeys = [],
  type = 'line',
  height = 300,
  showGrid = true,
  showLegend = true,
  emptyText = 'No chart data available.',
}) => {
  if (!Array.isArray(data) || !data.length || !Array.isArray(yKeys) || !yKeys.length) {
    return (
      <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        {emptyText}
      </div>
    );
  }

  const chartProps = { data, margin: { top: 8, right: 8, left: 0, bottom: 8 } };
  const series = renderSeries(type, yKeys);
  const commonChildren = (
    <>
      {showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> : null}
      <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
      <Tooltip />
      {showLegend ? <Legend /> : null}
      {series}
    </>
  );

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart {...chartProps}>{commonChildren}</BarChart>
        ) : type === 'area' ? (
          <AreaChart {...chartProps}>{commonChildren}</AreaChart>
        ) : (
          <LineChart {...chartProps}>{commonChildren}</LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
