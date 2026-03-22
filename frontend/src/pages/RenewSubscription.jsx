import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useSubscription, useRenewSubscription } from '../hooks/useSubscriptions';
import { DURATION_TYPES, PAYMENT_STATUSES } from '../utils/constants';
import { todayStr, calculateEndDateFromPurchase, formatDate } from '../utils/dateHelpers';
import { currency } from '../utils/formatters';

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
  const purchaseDate = watch('purchaseDate');
  const customDays = watch('customDays');
  const sellingPrice = watch('sellingPrice');
  const purchasePrice = watch('purchasePrice');

  const profitPreview = (Number(sellingPrice) || 0) - (Number(purchasePrice) || 0);
  const endPreview = calculateEndDateFromPurchase(purchaseDate, durationType, customDays);

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

  const handleClose = () => navigate(`/subscriptions/${id}`);

  const onSubmit = (data) => {
    renewMut.mutate(
      { id, data },
      {
        onSuccess: (newSub) => navigate(`/subscriptions/${newSub._id}`),
      }
    );
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
    <Drawer
      open
      onClose={handleClose}
      title="Renew subscription"
      description={`${sub?.clientName || 'Client'} · ${sub?.categoryId?.name || 'Category'}`}
      widthClassName="max-w-2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="renew-sub-form" loading={renewMut.isPending}>
            <RefreshCw className="h-4 w-4" /> Renew
          </Button>
        </div>
      }
    >
      <div className="mb-4 rounded-2xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm text-primary-900">
        Creates a new cycle while keeping history. If still active, the new period starts after the current end date.
      </div>

      <form id="renew-sub-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-violet-100/80 bg-gradient-to-br from-white to-violet-50/80 p-4 sm:p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Renewal details</h2>
          <Input label="Purchase date" type="date" {...register('purchaseDate')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Duration" options={DURATION_TYPES} {...register('durationType')} />
            {durationType === 'custom' && (
              <Input label="Custom days" type="number" error={errors.customDays?.message} {...register('customDays')} />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/80 p-4 sm:p-5 space-y-3">
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
          <Input label="Payment method" {...register('paymentMethod')} />
        </div>

        <div className="rounded-2xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/80 p-4 sm:p-5 space-y-3">
          <Textarea label="Notes" placeholder="Renewal notes…" {...register('notes')} />
        </div>

        <div className="rounded-2xl border border-dashed border-accent-200/80 bg-accent-50/40 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-800">New period end (preview)</p>
          <p className="mt-2 font-semibold text-slate-900">{endPreview ? formatDate(endPreview) : '—'}</p>
        </div>

        {renewMut.isError && (
          <p className="text-sm text-danger-600">
            {renewMut.error?.response?.data?.error?.message || 'Renewal failed'}
          </p>
        )}
      </form>
    </Drawer>
  );
}
