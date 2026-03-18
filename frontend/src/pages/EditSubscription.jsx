import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useSubscription, useUpdateSubscription } from '../hooks/useSubscriptions';
import { PAYMENT_STATUSES, TAG_OPTIONS } from '../utils/constants';

const schema = z.object({
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  sellingPrice: z.coerce.number().min(0).optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'partially_paid']).optional(),
  paymentMethod: z.string().optional(),
  amountReceived: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['cancelled']).optional(),
});

export default function EditSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sub, isLoading, isError, refetch } = useSubscription(id);
  const updateMut = useUpdateSubscription();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const tags = watch('tags') || [];

  useEffect(() => {
    if (sub) {
      reset({
        clientName: sub.clientName,
        clientPhone: sub.clientPhone,
        clientEmail: sub.clientEmail,
        sellingPrice: sub.sellingPrice,
        purchasePrice: sub.purchasePrice,
        paymentStatus: sub.paymentStatus,
        paymentMethod: sub.paymentMethod,
        amountReceived: sub.amountReceived,
        notes: sub.notes,
        tags: sub.tags || [],
        status: sub.status === 'cancelled' ? 'cancelled' : undefined,
      });
    }
  }, [sub, reset]);

  const toggleTag = (tag) => {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setValue('tags', next);
  };

  const onSubmit = (data) => {
    updateMut.mutate({ id, data }, { onSuccess: () => navigate(`/subscriptions/${id}`) });
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError || !sub) {
    return (
      <ErrorState
        title="Subscription unavailable"
        description="We couldn't load this subscription for editing."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Edit Subscription</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Client Info</h2>
          <Input label="Client Name" error={errors.clientName?.message} {...register('clientName')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Phone" {...register('clientPhone')} />
            <Input label="Email" type="email" error={errors.clientEmail?.message} {...register('clientEmail')} />
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
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Notes & Lifecycle</h2>
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Active, expiring, expired, and replacement statuses are managed automatically from dates and replacement events.
            If needed, you can still cancel the subscription below.
          </div>
          <Select label="Lifecycle Override" options={[{ value: 'cancelled', label: 'Cancel subscription' }]} placeholder="Keep current status" {...register('status')} />
          <Textarea label="Notes" {...register('notes')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    tags.includes(tag) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {updateMut.isError && (
          <p className="text-sm text-danger-600">
            {updateMut.error?.response?.data?.error?.message || 'Update failed'}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={updateMut.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
