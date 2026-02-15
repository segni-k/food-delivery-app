import React from 'react';
import { cn } from './utils';

const variantClassMap = {
  primary:
    'bg-orange-500 text-white hover:bg-orange-600 focus-visible:outline-orange-500',
  secondary:
    'bg-neutral-900 text-white hover:bg-neutral-700 focus-visible:outline-neutral-500 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200',
  outline:
    'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:outline-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
  ghost:
    'bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:outline-neutral-500 dark:text-neutral-200 dark:hover:bg-neutral-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500',
};

const sizeClassMap = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

const Button = React.forwardRef(
  (
    {
      type = 'button',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variantClassMap[variant] || variantClassMap.primary,
        sizeClassMap[size] || sizeClassMap.md,
        fullWidth ? 'w-full' : '',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      <span>{children}</span>
    </button>
  )
);

Button.displayName = 'Button';

export default Button;

