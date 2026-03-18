import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useLogin } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const loginMutation = useLogin();

  const onSubmit = (data) => loginMutation.mutate(data);
  const errorMessage =
    loginMutation.error?.response?.data?.error?.message ||
    (loginMutation.error?.message === 'Network Error'
      ? 'Could not reach the API. Check Vercel env vars and backend CORS settings.'
      : 'Login failed');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-200">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your subscriptions</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {loginMutation.isError && (
            <p className="text-sm text-danger-600">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="w-full" loading={loginMutation.isPending}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
