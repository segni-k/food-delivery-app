import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout';
import { forgotPasswordSchema } from '../features/auth/schemas';
import { useAuthStore } from '../store/authStore';

const ForgotPasswordPage = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const apiError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    clearError();
    setSuccessMessage('');

    try {
      await forgotPassword(values);
      setSuccessMessage('Password reset link has been sent if your email exists in the system.');
    } catch (_error) {
      // Error state handled in store.
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We will send reset instructions to your email.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
            placeholder="you@example.com"
          />
          {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
        </div>

        {apiError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">{apiError}</p> : null}
        {successMessage ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Submitting...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-sm">
        Remembered your password?{' '}
        <Link className="text-orange-500 hover:underline" to="/login">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
