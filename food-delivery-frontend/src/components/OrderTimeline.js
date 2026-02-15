import React from 'react';

const readableStatus = (status) =>
  String(status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const OrderTimeline = ({ timeline = [], currentStatus }) => {
  if (!timeline.length) {
    return null;
  }

  return (
    <ol className="space-y-3">
      {timeline.map((step) => (
        <li key={step.status} className="flex items-center gap-3">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step.completed
                ? 'bg-emerald-500 text-white'
                : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {step.completed ? 'OK' : '...'}
          </span>
          <div>
            <p className={`text-sm font-semibold ${step.active ? 'text-orange-600 dark:text-orange-300' : ''}`}>
              {readableStatus(step.status)}
            </p>
            {step.active || currentStatus === step.status ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Current status</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default OrderTimeline;

