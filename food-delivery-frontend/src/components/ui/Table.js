import React from 'react';
import { cn } from './utils';

export const TableContainer = ({ className = '', children }) => (
  <div className={cn('w-full overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-700', className)}>
    {children}
  </div>
);

export const Table = ({ className = '', children, ...props }) => (
  <table className={cn('min-w-full divide-y divide-neutral-200 dark:divide-neutral-700', className)} {...props}>
    {children}
  </table>
);

export const TableHead = ({ className = '', children }) => (
  <thead className={cn('bg-neutral-50 dark:bg-neutral-800/60', className)}>{children}</thead>
);

export const TableBody = ({ className = '', children }) => (
  <tbody className={cn('divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-900', className)}>{children}</tbody>
);

export const TableRow = ({ className = '', children }) => (
  <tr className={cn('hover:bg-neutral-50 dark:hover:bg-neutral-800/50', className)}>{children}</tr>
);

export const TableHeaderCell = ({ className = '', children, scope = 'col' }) => (
  <th
    scope={scope}
    className={cn('whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300', className)}
  >
    {children}
  </th>
);

export const TableCell = ({ className = '', children }) => (
  <td className={cn('whitespace-nowrap px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200', className)}>{children}</td>
);

