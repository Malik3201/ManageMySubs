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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-200">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-1 text-sm text-slate-500">Start managing your subscription sales</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {registerMutation.error?.response?.data?.error?.message || 'Registration failed'}
            </p>
          )}

          <Button type="submit" className="w-full" loading={registerMutation.isPending}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
