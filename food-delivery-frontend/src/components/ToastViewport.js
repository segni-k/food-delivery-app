import React from 'react';
import { useNotificationStore } from '../store/notificationStore';

const toneClass = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200',
  info: 'border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200',
};

const ToastViewport = () => {
  const toasts = useNotificationStore((state) => state.toasts);
  const dismiss = useNotificationStore((state) => state.dismiss);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={`pointer-events-auto rounded-xl border p-3 shadow-lg ${toneClass[toast.type] || toneClass.info}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
              <p className="text-sm">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-md px-2 py-1 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ToastViewport;

