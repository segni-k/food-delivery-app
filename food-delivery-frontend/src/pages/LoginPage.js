import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout';
import { loginSchema } from '../features/auth/schemas';
import { useAuthStore } from '../store/authStore';
import { getHomePathByRole } from '../utils/roleRedirect';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const apiError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    clearError();

    try {
      const result = await login(values);
      const next = new URLSearchParams(location.search).get('next');
      const safeNext = next && next.startsWith('/') ? next : null;
      navigate(safeNext || getHomePathByRole(result.user.role), { replace: true });
    } catch (_error) {
      // Error state handled in store.
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue managing your food delivery account.">
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

        {apiError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">{apiError}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-orange-500 hover:underline" to="/forgot-password">
          Forgot password?
        </Link>
        <p>
          No account?{' '}
          <Link className="text-orange-500 hover:underline" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
