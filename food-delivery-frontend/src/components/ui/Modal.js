import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { cn } from './utils';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer = null,
  closeOnOverlayClick = true,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onEsc = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
        className={cn(
          'w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900',
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-lg font-bold">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </div>

        <div>{children}</div>

        {footer ? <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-700">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
};

export default Modal;

