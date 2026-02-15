import React from 'react';
import { cn } from './utils';

const Input = React.forwardRef(
  (
    {
      id,
      label,
      hint,
      error,
      type = 'text',
      leftSlot = null,
      rightSlot = null,
      className = '',
      inputClassName = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const descriptionId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn('space-y-1', className)}>
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {label}
          </label>
        ) : null}

        <div
          className={cn(
            'flex items-center rounded-xl border border-neutral-300 bg-white px-3 dark:border-neutral-700 dark:bg-neutral-900',
            error ? 'border-red-400 dark:border-red-500' : ''
          )}
        >
          {leftSlot ? <span className="mr-2 text-neutral-500 dark:text-neutral-400">{leftSlot}</span> : null}
          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={Boolean(error)}
            aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
            className={cn(
              'h-10 w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100',
              inputClassName
            )}
            {...props}
          />
          {rightSlot ? <span className="ml-2 text-neutral-500 dark:text-neutral-400">{rightSlot}</span> : null}
        </div>

        {hint ? (
          <p id={descriptionId} className="text-xs text-neutral-500 dark:text-neutral-400">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

