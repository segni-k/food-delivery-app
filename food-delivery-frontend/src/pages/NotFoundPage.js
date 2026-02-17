import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-300">404</p>
      <h1 className="mt-2 text-3xl font-black">Page not found</h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Back to home
      </Link>
    </div>
  </main>
);

export default NotFoundPage;

