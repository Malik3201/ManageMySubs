import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useRegister } from '../hooks/useAuth';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

export default function Signup() {
  const { register: reg, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const registerMutation = useRegister();

  const onSubmit = (data) => registerMutation.mutate(data);
  const errorMessage =
    registerMutation.error?.response?.data?.error?.message ||
    (registerMutation.error?.message === 'Network Error'
      ? 'Could not reach the API. Check Vercel env vars and backend CORS settings.'
      : 'Registration failed');

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-8rem] top-[-6rem] h-56 w-56 rounded-full bg-primary-200/45 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-[-5rem] h-60 w-60 rounded-full bg-warning-100/70 blur-3xl" />
      </div>

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary-600">Seller Setup</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-slate-950">
            Create your seller workspace and start managing every subscription cycle clearly.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
            Add categories, onboard clients, issue replacements, schedule reminders, and keep your revenue visible from day one.
          </p>
        </div>

        <div className="w-full max-w-sm justify-self-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-[0_20px_40px_-18px_rgba(79,70,229,0.8)]">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
          <p className="mt-2 text-sm text-slate-500">Start managing your subscription sales</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:p-7">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...reg('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...reg('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...reg('password')}
          />

          {registerMutation.isError && (
            <p className="text-sm text-danger-600">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="w-full" loading={registerMutation.isPending}>
            Create Account
          </Button>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Your account is isolated by seller, so only your categories, subscriptions, reminders, and reports are visible to you.
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign In
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
