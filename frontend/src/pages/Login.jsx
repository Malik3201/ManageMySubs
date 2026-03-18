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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-7rem] h-56 w-56 rounded-full bg-primary-200/45 blur-3xl" />
        <div className="absolute bottom-[-7rem] right-[-6rem] h-60 w-60 rounded-full bg-success-100/60 blur-3xl" />
      </div>

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary-600">ManageMySubs</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-slate-950">
            Subscription selling, renewals, reminders, and profits in one focused workspace.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
            Keep seller operations fast with mobile-friendly workflows, payment tracking, and a polished dashboard that stays clear even on busy days.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Clients</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">All-in-one</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Renewals</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Tracked</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Profit</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Clear</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm justify-self-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-[0_20px_40px_-18px_rgba(79,70,229,0.8)]">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage your subscriptions</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:p-7">
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

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Quick access to categories, renewals, reminders, replacements, and daily profit tracking.
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
            Sign Up
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
