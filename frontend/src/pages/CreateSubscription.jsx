import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layers } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import { useCategories } from '../hooks/useCategories';
import { useCreateSubscription } from '../hooks/useSubscriptions';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { DURATION_TYPES, PAYMENT_STATUSES, TAG_OPTIONS } from '../utils/constants';
import { todayStr, calculateEndDateFromPurchase, formatDate } from '../utils/dateHelpers';
import { currency } from '../utils/formatters';

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
  const sellingPrice = watch('sellingPrice');
  const purchasePrice = watch('purchasePrice');
  const purchaseDate = watch('purchaseDate');
  const customDays = watch('customDays');

  const profitPreview = (Number(sellingPrice) || 0) - (Number(purchasePrice) || 0);
  const endPreview = calculateEndDateFromPurchase(purchaseDate, durationType, customDays);

  const handleClose = () => navigate('/subscriptions');

  const categoryField = register('categoryId');

  const onCategoryChange = (e) => {
    categoryField.onChange(e);
    const catId = e.target.value;
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
    createMut.mutate(data, { onSuccess: () => handleClose() });
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
    <Drawer
      open
      onClose={handleClose}
      title="New subscription"
      description="Fast entry with live profit and renewal-end preview."
      widthClassName="max-w-2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-sub-form" loading={createMut.isPending}>
            Create subscription
          </Button>
        </div>
      }
    >
      <form id="create-sub-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-primary-100/80 bg-gradient-to-br from-white to-primary-50/80 p-4 space-y-3 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subscription</h2>
          <Select
            label="Category"
            options={catOptions}
            placeholder="Select category"
            error={errors.categoryId?.message}
            name={categoryField.name}
            ref={categoryField.ref}
            onBlur={categoryField.onBlur}
            onChange={onCategoryChange}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Duration" options={DURATION_TYPES} error={errors.durationType?.message} {...register('durationType')} />
            {durationType === 'custom' && (
              <Input label="Custom days" type="number" error={errors.customDays?.message} {...register('customDays')} />
            )}
          </div>
          <Input label="Purchase date" type="date" {...register('purchaseDate')} />
        </div>

        <div className="rounded-2xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/70 p-4 sm:p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</h2>
          <Input label="Client name" placeholder="Name" error={errors.clientName?.message} {...register('clientName')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Phone" placeholder="Phone" {...register('clientPhone')} />
            <Input label="Email" type="email" placeholder="Email" error={errors.clientEmail?.message} {...register('clientEmail')} />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/70 p-4 sm:p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing & payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Selling price" type="number" step="0.01" {...register('sellingPrice')} />
            <Input label="Purchase price" type="number" step="0.01" {...register('purchasePrice')} />
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-white/80 px-3 py-2 text-sm">
            <span className="text-slate-500">Estimated profit: </span>
            <span className="font-semibold text-emerald-700">{currency(profitPreview)}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Payment status" options={PAYMENT_STATUSES} {...register('paymentStatus')} />
            <Input label="Amount received" type="number" step="0.01" {...register('amountReceived')} />
          </div>
          <Input label="Payment method" placeholder="Cash, UPI…" {...register('paymentMethod')} />
        </div>

        <div className="rounded-2xl border border-violet-100/80 bg-gradient-to-br from-white to-violet-50/70 p-4 sm:p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes & tags</h2>
          <Textarea label="Notes" placeholder="Optional" {...register('notes')} />
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

        <div className="rounded-2xl border border-dashed border-accent-200/80 bg-accent-50/40 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-800">Cycle preview</p>
          <p className="mt-2">
            Estimated period end:{' '}
            <span className="font-semibold text-slate-900">{endPreview ? formatDate(endPreview) : '—'}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Matches server rules (30 / 365 / custom days from purchase date).</p>
        </div>

        {createMut.isError && (
          <p className="text-sm text-danger-600">
            {createMut.error?.response?.data?.error?.message || 'Failed to create subscription'}
          </p>
        )}
      </form>
    </Drawer>
  );
}
