import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout';
import { registerSchema } from '../features/auth/schemas';
import { useAuthStore } from '../store/authStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const apiError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (values) => {
    clearError();

    try {
      await registerUser(values);
      navigate('/login', { replace: true });
    } catch (_error) {
      // Error state handled in store.
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Set up your account to order and track deliveries.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            type="text"
            {...register('name')}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
            placeholder="Jane Doe"
          />
          {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}
        </div>

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

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
            placeholder="********"
          />
          {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Confirm password</label>
          <input
            type="password"
            {...register('password_confirmation')}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
            placeholder="********"
          />
          {errors.password_confirmation ? <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p> : null}
        </div>

        {apiError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">{apiError}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm">
        Already have an account?{' '}
        <Link className="text-orange-500 hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
