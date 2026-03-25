import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '../components/ui/DataTable';
import { useCreateReseller, useResellers } from '../hooks/useResellers';
import { currency } from '../utils/formatters';

export default function Resellers() {
  const navigate = useNavigate();
  const { data: rows, isLoading, isError, refetch } = useResellers();
  const createMut = useCreateReseller();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', phone: '' } });

  const totals = (rows || []).reduce(
    (acc, r) => {
      acc.sales += r.totalSales || 0;
      acc.profit += r.totalProfit || 0;
      acc.orders += r.totalOrders || 0;
      return acc;
    },
    { sales: 0, profit: 0, orders: 0 }
  );

  const onSubmit = (data) => {
    createMut.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset({ name: '', phone: '' });
      },
    });
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return (
      <ErrorState
        title="Resellers unavailable"
        description="We couldn't load resellers right now."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Channel sales"
        title="Resellers"
        description="Track reseller performance, profit, and order volume in one place."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigate('/reseller-orders')}>
              Reseller Orders
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New reseller
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/80"><CardBody><p className="text-xs text-slate-500">Total Reseller Sales</p><p className="mt-1 text-2xl font-bold text-blue-700">{currency(totals.sales)}</p></CardBody></Card>
        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80"><CardBody><p className="text-xs text-slate-500">Total Reseller Profit</p><p className="mt-1 text-2xl font-bold text-emerald-700">{currency(totals.profit)}</p></CardBody></Card>
        <Card className="border-violet-100 bg-gradient-to-br from-white to-violet-50/80"><CardBody><p className="text-xs text-slate-500">Total Reseller Orders</p><p className="mt-1 text-2xl font-bold text-violet-700">{totals.orders}</p></CardBody></Card>
      </div>

      {!rows?.length ? (
        <EmptyState icon={Store} title="No resellers yet" description="Create reseller accounts to start tracking reseller orders." />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>Reseller</DataTableHeaderCell>
            <DataTableHeaderCell>Phone</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Total sales</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Total profit</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Total orders</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {rows.map((r) => (
              <DataTableRow key={r._id} onClick={() => navigate(`/resellers/${r._id}`)}>
                <DataTableCell className="font-semibold text-slate-900">{r.name}</DataTableCell>
                <DataTableCell>{r.phone || '—'}</DataTableCell>
                <DataTableCell numeric>{currency(r.totalSales || 0)}</DataTableCell>
                <DataTableCell numeric className="font-semibold text-emerald-700">{currency(r.totalProfit || 0)}</DataTableCell>
                <DataTableCell numeric>{r.totalOrders || 0}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create reseller">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Reseller name" {...register('name', { required: true })} />
          <Input label="Phone" {...register('phone')} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
