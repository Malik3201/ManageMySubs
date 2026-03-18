import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useSubscription, useRenewSubscription } from '../hooks/useSubscriptions';
import { DURATION_TYPES, PAYMENT_STATUSES } from '../utils/constants';
import { todayStr } from '../utils/dateHelpers';

const schema = z.object({
  purchaseDate: z.string().optional(),
  sellingPrice: z.coerce.number().min(0).optional().default(0),
  purchasePrice: z.coerce.number().min(0).optional().default(0),
  durationType: z.enum(['monthly', 'yearly', 'custom']),
  customDays: z.coerce.number().int().min(1).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'partially_paid']).optional().default('pending'),
  paymentMethod: z.string().optional().default(''),
  amountReceived: z.coerce.number().min(0).optional().default(0),
  notes: z.string().optional().default(''),
}).refine(
  (d) => d.durationType !== 'custom' || (d.customDays && d.customDays > 0),
  { message: 'Custom days required', path: ['customDays'] }
);

export default function RenewSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sub, isLoading, isError, refetch } = useSubscription(id);
  const renewMut = useRenewSubscription();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { durationType: 'monthly', paymentStatus: 'pending', purchaseDate: todayStr() },
  });

  const durationType = watch('durationType');

  useEffect(() => {
    if (sub) {
      reset({
        purchaseDate: todayStr(),
        sellingPrice: sub.sellingPrice,
        purchasePrice: sub.purchasePrice,
        durationType: sub.durationType,
        customDays: sub.customDays || undefined,
        paymentStatus: 'pending',
        paymentMethod: sub.paymentMethod,
        amountReceived: 0,
        notes: '',
      });
    }
  }, [sub, reset]);

  const onSubmit = (data) => {
    renewMut.mutate({ id, data }, {
      onSuccess: (newSub) => navigate(`/subscriptions/${newSub._id}`),
    });
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError || !sub) {
    return (
      <ErrorState
        title="Renewal unavailable"
        description="We couldn't load this subscription for renewal."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary-50 p-2">
          <RefreshCw className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Renew Subscription</h1>
          <p className="text-sm text-slate-500">{sub?.clientName || 'Client'} — {sub?.categoryId?.name}</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm text-primary-900">
        This renewal creates a fresh cycle while preserving history. If the current subscription is still active,
        the new cycle starts after the current end date to avoid overlap.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Renewal Details</h2>
          <Input label="Purchase Date" type="date" {...register('purchaseDate')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Duration" options={DURATION_TYPES} {...register('durationType')} />
            {durationType === 'custom' && (
              <Input label="Custom Days" type="number" error={errors.customDays?.message} {...register('customDays')} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Pricing & Payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Selling Price" type="number" step="0.01" {...register('sellingPrice')} />
            <Input label="Purchase Price" type="number" step="0.01" {...register('purchasePrice')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Payment Status" options={PAYMENT_STATUSES} {...register('paymentStatus')} />
            <Input label="Amount Received" type="number" step="0.01" {...register('amountReceived')} />
          </div>
          <Input label="Payment Method" {...register('paymentMethod')} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <Textarea label="Notes" placeholder="Renewal notes..." {...register('notes')} />
        </div>

        {renewMut.isError && (
          <p className="text-sm text-danger-600">
            {renewMut.error?.response?.data?.error?.message || 'Renewal failed'}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={renewMut.isPending}>
            <RefreshCw className="h-4 w-4" /> Renew Subscription
          </Button>
        </div>
      </form>
    </div>
  );
}
