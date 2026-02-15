import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Keep logs for local debugging and observability tooling hooks.
    // eslint-disable-next-line no-console
    console.error('AppErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
          <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm dark:border-red-900/40 dark:bg-neutral-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-300">
              Application Error
            </p>
            <h1 className="mt-2 text-2xl font-black">Something went wrong</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Please refresh the page. If this continues, contact support.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error ? (
              <pre className="mt-4 overflow-auto rounded-xl bg-neutral-100 p-3 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            ) : null}
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;

