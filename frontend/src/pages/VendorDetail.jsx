import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '../components/ui/DataTable';
import { useAddVendorPayment, useVendor, useVendorTransactions } from '../hooks/useVendors';
import { currency } from '../utils/formatters';
import { formatDate } from '../utils/dateHelpers';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vendor, isLoading, isError, refetch } = useVendor(id);
  const { data: txs, isLoading: txLoading } = useVendorTransactions(id);
  const addPaymentMut = useAddVendorPayment();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError || !vendor) {
    return (
      <ErrorState
        title="Vendor unavailable"
        description="We couldn't load this vendor."
        onRetry={refetch}
      />
    );
  }

  const submitPayment = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    addPaymentMut.mutate(
      { vendorId: id, data: { amount: n, note } },
      {
        onSuccess: () => {
          setOpen(false);
          setAmount('');
          setNote('');
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/vendors')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Vendors
      </button>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-primary-900 to-primary-700 text-white shadow-[0_30px_80px_-35px_rgba(67,56,202,0.7)]">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-200">Vendor Ledger</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{vendor.name}</h1>
            <p className="mt-1 text-sm text-primary-100/80">Auto-calculated from subscription cost prices and manual vendor payments.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add payment
          </Button>
        </CardBody>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-danger-100 bg-gradient-to-br from-white to-danger-50/80">
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-danger-600">Total payable</p>
            <p className="mt-2 text-2xl font-bold text-danger-700">{currency(vendor.totalPayable)}</p>
          </CardBody>
        </Card>
        <Card className="border-success-100 bg-gradient-to-br from-white to-success-50/80">
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-success-600">Total paid</p>
            <p className="mt-2 text-2xl font-bold text-success-700">{currency(vendor.totalPaid)}</p>
          </CardBody>
        </Card>
        <Card className="border-warning-100 bg-gradient-to-br from-white to-warning-50/80">
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warning-600">Balance</p>
            <p className="mt-2 text-2xl font-bold text-warning-700">{currency(vendor.balance)}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="text-sm font-semibold text-slate-700">Payment Transactions</h2></CardHeader>
        <CardBody>
          {txLoading ? (
            <LoadingSpinner />
          ) : !txs?.length ? (
            <p className="text-sm text-slate-500 py-4">No payments recorded yet.</p>
          ) : (
            <DataTable className="border-0 shadow-none">
              <DataTableHead>
                <DataTableHeaderCell>Date</DataTableHeaderCell>
                <DataTableHeaderCell>Type</DataTableHeaderCell>
                <DataTableHeaderCell>Note</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">Amount</DataTableHeaderCell>
              </DataTableHead>
              <DataTableBody>
                {txs.map((tx) => (
                  <DataTableRow key={tx._id}>
                    <DataTableCell>{formatDate(tx.createdAt)}</DataTableCell>
                    <DataTableCell className="font-medium text-slate-700">{tx.type}</DataTableCell>
                    <DataTableCell>{tx.note || '—'}</DataTableCell>
                    <DataTableCell numeric className="font-semibold text-success-700">{currency(tx.amount)}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </CardBody>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`Add Payment · ${vendor.name}`}>
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="Note"
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {addPaymentMut.isError && (
            <p className="text-sm text-danger-600">
              {addPaymentMut.error?.response?.data?.error?.message || 'Failed'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitPayment} loading={addPaymentMut.isPending}>Save Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
