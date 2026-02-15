import React from 'react';
import { cn } from './utils';

const sizeClassMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

const LoadingSpinner = ({ label = 'Loading', size = 'md', className = '' }) => (
  <div role="status" aria-live="polite" className={cn('inline-flex items-center gap-2', className)}>
    <span
      className={cn(
        'inline-flex animate-spin rounded-full border-current border-r-transparent text-orange-500',
        sizeClassMap[size] || sizeClassMap.md
      )}
      aria-hidden="true"
    />
    <span className="text-sm text-neutral-600 dark:text-neutral-300">{label}</span>
  </div>
);

export default LoadingSpinner;

