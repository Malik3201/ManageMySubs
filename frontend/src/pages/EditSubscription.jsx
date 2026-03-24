import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useSubscription, useUpdateSubscription } from '../hooks/useSubscriptions';
import { useVendors } from '../hooks/useVendors';
import { PAYMENT_STATUSES, TAG_OPTIONS } from '../utils/constants';
import { currency } from '../utils/formatters';

const schema = z.object({
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  vendorId: z.string().nullable().optional(),
  vendorName: z.string().optional(),
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
  const { data: vendors } = useVendors();
  const updateMut = useUpdateSubscription();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const tags = watch('tags') || [];
  const sellingPrice = watch('sellingPrice');
  const purchasePrice = watch('purchasePrice');
  const profitPreview = (Number(sellingPrice) || 0) - (Number(purchasePrice) || 0);
  const vendorOptions = (vendors || []).map((v) => ({ value: v._id, label: v.name }));

  useEffect(() => {
    if (sub) {
      reset({
        clientName: sub.clientName,
        clientPhone: sub.clientPhone,
        clientEmail: sub.clientEmail,
        vendorId: sub.vendorId?._id || '',
        vendorName: '',
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

  const handleClose = () => navigate(`/subscriptions/${id}`);

  const onSubmit = (data) => {
    updateMut.mutate({ id, data }, { onSuccess: () => handleClose() });
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
    <Drawer
      open
      onClose={handleClose}
      title="Edit subscription"
      description={`${sub.clientName || 'Client'} · ${sub.categoryId?.name || 'Category'}`}
      widthClassName="max-w-2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-sub-form" loading={updateMut.isPending}>
            Save changes
          </Button>
        </div>
      }
    >
      <form id="edit-sub-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/70 p-4 sm:p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</h2>
          <Input label="Client name" error={errors.clientName?.message} {...register('clientName')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Phone" {...register('clientPhone')} />
            <Input label="Email" type="email" error={errors.clientEmail?.message} {...register('clientEmail')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Vendor (optional)" options={vendorOptions} placeholder="Select vendor" {...register('vendorId')} />
            <Input label="Or new vendor name" placeholder="e.g. Ali" {...register('vendorName')} />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/70 p-4 sm:p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing & payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Selling price" type="number" step="0.01" {...register('sellingPrice')} />
            <Input label="Purchase price" type="number" step="0.01" {...register('purchasePrice')} />
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-white/80 px-3 py-2 text-sm">
            <span className="text-slate-500">Profit (preview): </span>
            <span className="font-semibold text-emerald-700">{currency(profitPreview)}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Payment status" options={PAYMENT_STATUSES} {...register('paymentStatus')} />
            <Input label="Amount received" type="number" step="0.01" {...register('amountReceived')} />
          </div>
          <Input label="Payment method" {...register('paymentMethod')} />
        </div>

        <div className="rounded-2xl border border-amber-100/80 bg-gradient-to-br from-white to-amber-50/70 p-4 sm:p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes & lifecycle</h2>
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-500">
            Status (active, expiring, expired, replacement) is computed from dates and events. You can cancel below.
          </div>
          <Select
            label="Lifecycle override"
            options={[{ value: 'cancelled', label: 'Cancel subscription' }]}
            placeholder="Keep current status"
            {...register('status')}
          />
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
      </form>
    </Drawer>
  );
}
