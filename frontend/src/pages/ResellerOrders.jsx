import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useCategories } from '../hooks/useCategories';
import { useCreateResellerOrder, useResellerPrice, useResellers } from '../hooks/useResellers';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { PAYMENT_STATUSES } from '../utils/constants';
import { currency, paymentColor } from '../utils/formatters';
import { formatDate } from '../utils/dateHelpers';

export default function ResellerOrders() {
  const { data: resellers } = useResellers();
  const { data: categories, isLoading: catLoading, isError: catError, refetch: refetchCategories } = useCategories();
  const createMut = useCreateResellerOrder();
  const { data: orders, isLoading: ordersLoading } = useSubscriptions({ isResellerSale: 'true', limit: 20, sort: 'latest' });

  const { register, watch, setValue, handleSubmit, reset } = useForm({
    defaultValues: {
      resellerId: '',
      subscriptionId: '',
      clientEmail: '',
      paymentStatus: 'pending',
      amountReceived: '',
      paymentMethod: '',
      notes: '',
    },
  });

  const resellerId = watch('resellerId');
  const subscriptionId = watch('subscriptionId');
  const paymentStatus = watch('paymentStatus');
  const priceQuery = useResellerPrice(resellerId, subscriptionId);

  useEffect(() => {
    if (priceQuery.data?.sellingPrice !== undefined) {
      setValue('amountReceived', paymentStatus === 'paid' ? String(priceQuery.data.sellingPrice) : '');
    }
  }, [priceQuery.data, paymentStatus, setValue]);

  const onSubmit = (data) => {
    createMut.mutate(
      {
        resellerId: data.resellerId,
        subscriptionId: data.subscriptionId,
        clientEmail: data.clientEmail,
        paymentStatus: data.paymentStatus,
        amountReceived: data.amountReceived ? Number(data.amountReceived) : undefined,
        paymentMethod: data.paymentMethod || '',
        notes: data.notes || '',
      },
      {
        onSuccess: () => {
          reset({
            resellerId: '',
            subscriptionId: '',
            clientEmail: '',
            paymentStatus: 'pending',
            amountReceived: '',
            paymentMethod: '',
            notes: '',
          });
        },
      }
    );
  };

  if (catLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (catError) {
    return (
      <ErrorState
        title="Reseller order form unavailable"
        description="We couldn't load subscriptions for reseller orders."
        onRetry={refetchCategories}
      />
    );
  }

  const resellerOptions = (resellers || []).map((r) => ({ value: r._id, label: r.name }));
  const subscriptionOptions = (categories || []).map((c) => ({ value: c._id, label: c.name }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Orders"
        title="Reseller Orders"
        description="Create channel orders with auto-applied pricing from reseller pricing rules."
      />

      <Card className="border-primary-100 bg-gradient-to-br from-white to-primary-50/60">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Reseller" options={resellerOptions} {...register('resellerId')} />
              <Select label="Subscription" options={subscriptionOptions} {...register('subscriptionId')} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Auto applied reseller price: </span>
              <span className="font-semibold text-primary-700">
                {priceQuery.isLoading ? 'Loading...' : priceQuery.data ? currency(priceQuery.data.sellingPrice) : 'Select reseller + subscription'}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Client email" type="email" {...register('clientEmail', { required: true })} />
              <Select label="Payment status" options={PAYMENT_STATUSES} {...register('paymentStatus')} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Amount received (only for partial/paid)" type="number" step="0.01" {...register('amountReceived')} />
              <Input label="Payment method" {...register('paymentMethod')} />
            </div>

            <Input label="Notes" {...register('notes')} />

            {createMut.isError && (
              <p className="text-sm text-danger-600">{createMut.error?.response?.data?.error?.message || 'Failed to create order'}</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" loading={createMut.isPending} disabled={!priceQuery.data}>
                Submit Reseller Order
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent Reseller Orders</h2>
          {ordersLoading ? (
            <LoadingSpinner />
          ) : !orders?.data?.length ? (
            <p className="text-sm text-slate-500">No reseller orders yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.data.map((o) => (
                <div key={o._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {o.resellerId?.name || 'Reseller'} · {o.categoryId?.name || 'Subscription'}
                    </p>
                    <p className="text-xs text-slate-500">{o.clientEmail || 'No email'} · {formatDate(o.purchaseDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-700">{currency(o.profit || 0)}</span>
                    <Badge className={paymentColor(o.paymentStatus)}>{o.paymentStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
