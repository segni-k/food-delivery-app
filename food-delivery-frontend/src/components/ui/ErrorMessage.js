import React from 'react';
import Button from './Button';
import { cn } from './utils';

const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'Please try again.',
  actionLabel = '',
  onAction,
  className = '',
}) => (
  <div
    role="alert"
    className={cn(
      'rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200',
      className
    )}
  >
    <p className="text-sm font-semibold">{title}</p>
    <p className="mt-1 text-sm">{message}</p>
    {actionLabel && onAction ? (
      <div className="mt-3">
        <Button variant="danger" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    ) : null}
  </div>
);

export default ErrorMessage;

