import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { useCategories } from '../hooks/useCategories';
import { useCreateSubscription } from '../hooks/useSubscriptions';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { DURATION_TYPES, PAYMENT_STATUSES, TAG_OPTIONS } from '../utils/constants';
import { todayStr } from '../utils/dateHelpers';
import { Layers } from 'lucide-react';

const schema = z.object({
  categoryId: z.string().min(1, 'Category required'),
  clientName: z.string().optional().default(''),
  clientPhone: z.string().optional().default(''),
  clientEmail: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
  purchaseDate: z.string().optional(),
  sellingPrice: z.coerce.number().min(0).optional().default(0),
  purchasePrice: z.coerce.number().min(0).optional().default(0),
  durationType: z.enum(['monthly', 'yearly', 'custom']),
  customDays: z.coerce.number().int().min(1).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'partially_paid']).optional().default('pending'),
  paymentMethod: z.string().optional().default(''),
  amountReceived: z.coerce.number().min(0).optional().default(0),
  notes: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
}).refine(
  (d) => d.durationType !== 'custom' || (d.customDays && d.customDays > 0),
  { message: 'Custom days required', path: ['customDays'] }
);

export default function CreateSubscription() {
  const navigate = useNavigate();
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const createMut = useCreateSubscription();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      durationType: 'monthly',
      paymentStatus: 'pending',
      purchaseDate: todayStr(),
      tags: [],
    },
  });

  const durationType = watch('durationType');
  const tags = watch('tags') || [];

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setValue('categoryId', catId, { shouldDirty: true, shouldValidate: true });
    const cat = categories?.find((c) => c._id === catId);
    if (cat) {
      setValue('purchasePrice', cat.defaultPurchasePrice || 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const toggleTag = (tag) => {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setValue('tags', next);
  };

  const onSubmit = (data) => {
    createMut.mutate(data, { onSuccess: () => navigate('/subscriptions') });
  };

  const catOptions = (categories || []).map((c) => ({ value: c._id, label: c.name }));

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return (
      <ErrorState
        title="Categories unavailable"
        description="Load categories before creating a subscription."
        onRetry={refetch}
      />
    );
  }
  if (!categories?.length) {
    return (
      <EmptyState
        icon={Layers}
        title="Create a category first"
        description="Subscriptions are created from your category list. Add at least one category before continuing."
      >
        <Button onClick={() => navigate('/categories')}>Go to Categories</Button>
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">New Sale</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Create a subscription quickly</h1>
        <p className="mt-1 text-sm text-slate-500">The form is organized for fast mobile entry with category defaults and clear payment inputs.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-primary-100/80 bg-gradient-to-br from-white to-primary-50/80 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Subscription Info</h2>
          <Select label="Category" options={catOptions} placeholder="Select category" error={errors.categoryId?.message} {...register('categoryId')} onChange={handleCategoryChange} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Duration" options={DURATION_TYPES} error={errors.durationType?.message} {...register('durationType')} />
            {durationType === 'custom' && (
              <Input label="Custom Days" type="number" error={errors.customDays?.message} {...register('customDays')} />
            )}
          </div>
          <Input label="Purchase Date" type="date" {...register('purchaseDate')} />
        </div>

        <div className="rounded-2xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/80 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Client Info</h2>
          <Input label="Client Name" placeholder="Client name" error={errors.clientName?.message} {...register('clientName')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Phone" placeholder="Phone number" {...register('clientPhone')} />
            <Input label="Email" type="email" placeholder="Email" error={errors.clientEmail?.message} {...register('clientEmail')} />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/80 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Pricing & Payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Selling Price" type="number" step="0.01" {...register('sellingPrice')} />
            <Input label="Purchase Price" type="number" step="0.01" {...register('purchasePrice')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Payment Status" options={PAYMENT_STATUSES} {...register('paymentStatus')} />
            <Input label="Amount Received" type="number" step="0.01" {...register('amountReceived')} />
          </div>
          <Input label="Payment Method" placeholder="e.g. Cash, UPI, Bank" {...register('paymentMethod')} />
        </div>

        <div className="rounded-2xl border border-violet-100/80 bg-gradient-to-br from-white to-violet-50/80 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Notes & Tags</h2>
          <Textarea label="Notes" placeholder="Optional notes..." {...register('notes')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    tags.includes(tag)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {createMut.isError && (
          <p className="text-sm text-danger-600">
            {createMut.error?.response?.data?.error?.message || 'Failed to create subscription'}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={createMut.isPending}>Create Subscription</Button>
        </div>
      </form>
    </div>
  );
}
