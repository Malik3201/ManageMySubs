import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandCoins, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/ui/PageHeader';
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
import { useCreateVendor, useVendors } from '../hooks/useVendors';
import { currency } from '../utils/formatters';

export default function Vendors() {
  const navigate = useNavigate();
  const { data: vendors, isLoading, isError, refetch } = useVendors();
  const createMut = useCreateVendor();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '' } });

  const onSubmit = (data) => {
    createMut.mutate(
      { name: data.name },
      {
        onSuccess: () => {
          setOpen(false);
          reset({ name: '' });
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return (
      <ErrorState
        title="Vendors unavailable"
        description="We couldn't load vendor accounting right now."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Accounting"
        title="Vendors"
        description="Auto vendor payables from subscription cost prices and payment history."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New vendor
          </Button>
        }
      />

      {!vendors?.length ? (
        <EmptyState
          icon={HandCoins}
          title="No vendors yet"
          description="Create vendors or assign vendor names while adding subscriptions."
        >
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Create vendor
          </Button>
        </EmptyState>
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>Vendor</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Total payable</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Total paid</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Balance</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Open</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {vendors.map((v) => (
              <DataTableRow key={v._id} onClick={() => navigate(`/vendors/${v._id}`)}>
                <DataTableCell className="font-semibold text-slate-900">{v.name}</DataTableCell>
                <DataTableCell numeric className="font-semibold text-danger-700">
                  {currency(v.totalPayable)}
                </DataTableCell>
                <DataTableCell numeric className="font-semibold text-success-700">
                  {currency(v.totalPaid)}
                </DataTableCell>
                <DataTableCell numeric className="font-semibold text-warning-700">
                  {currency(v.balance)}
                </DataTableCell>
                <DataTableCell numeric>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/vendors/${v._id}`);
                    }}
                  >
                    View
                  </Button>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create vendor">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Vendor name" placeholder="e.g. Ali" {...register('name', { required: true })} />
          {createMut.isError && (
            <p className="text-sm text-danger-600">
              {createMut.error?.response?.data?.error?.message || 'Failed'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMut.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
