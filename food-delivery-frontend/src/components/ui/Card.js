import React from 'react';
import { cn } from './utils';

export const Card = ({ className = '', children }) => (
  <article className={cn('rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900', className)}>
    {children}
  </article>
);

export const CardHeader = ({ className = '', children }) => (
  <header className={cn('border-b border-neutral-200 p-4 dark:border-neutral-700', className)}>{children}</header>
);

export const CardTitle = ({ className = '', children }) => (
  <h3 className={cn('text-base font-bold', className)}>{children}</h3>
);

export const CardDescription = ({ className = '', children }) => (
  <p className={cn('mt-1 text-sm text-neutral-500 dark:text-neutral-400', className)}>{children}</p>
);

export const CardBody = ({ className = '', children }) => (
  <div className={cn('p-4', className)}>{children}</div>
);

export const CardFooter = ({ className = '', children }) => (
  <footer className={cn('border-t border-neutral-200 p-4 dark:border-neutral-700', className)}>{children}</footer>
);

