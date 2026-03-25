import { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '../components/ui/DataTable';
import { useCategories } from '../hooks/useCategories';
import { useReseller, useSaveResellerPricing } from '../hooks/useResellers';
import { currency, paymentColor } from '../utils/formatters';
import { formatDate } from '../utils/dateHelpers';

export default function ResellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: reseller, isLoading, isError, refetch } = useReseller(id);
  const { data: categories } = useCategories();
  const savePricingMut = useSaveResellerPricing(id);
  const [prices, setPrices] = useState({});

  const priceByCategory = useMemo(() => {
    const map = {};
    (reseller?.pricing || []).forEach((p) => {
      map[p.subscriptionId?._id] = p.sellingPrice;
    });
    return map;
  }, [reseller]);

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError || !reseller) {
    return (
      <ErrorState
        title="Reseller unavailable"
        description="We couldn't load this reseller."
        onRetry={refetch}
      />
    );
  }

  const handleSave = (subscriptionId) => {
    const raw = prices[subscriptionId];
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return;
    savePricingMut.mutate({ subscriptionId, sellingPrice: value });
  };

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/resellers')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Resellers
      </button>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-indigo-900 to-indigo-700 text-white">
        <CardBody className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Reseller Profile</p>
          <h1 className="text-2xl font-bold">{reseller.name}</h1>
          <p className="text-sm text-indigo-100/80">{reseller.phone || 'No phone provided'}</p>
        </CardBody>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/80"><CardBody><p className="text-xs text-slate-500">Total sales</p><p className="mt-1 text-2xl font-bold text-blue-700">{currency(reseller.totalSales || 0)}</p></CardBody></Card>
        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80"><CardBody><p className="text-xs text-slate-500">Total profit generated</p><p className="mt-1 text-2xl font-bold text-emerald-700">{currency(reseller.totalProfit || 0)}</p></CardBody></Card>
        <Card className="border-violet-100 bg-gradient-to-br from-white to-violet-50/80"><CardBody><p className="text-xs text-slate-500">Total orders</p><p className="mt-1 text-2xl font-bold text-violet-700">{reseller.totalOrders || 0}</p></CardBody></Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Reseller Pricing</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {(categories || []).map((c) => (
            <div key={c._id} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
              <div>
                <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">Current price: {currency(priceByCategory[c._id] || 0)}</p>
              </div>
              <Input
                label="Selling price"
                type="number"
                step="0.01"
                value={prices[c._id] ?? priceByCategory[c._id] ?? ''}
                onChange={(e) => setPrices((prev) => ({ ...prev, [c._id]: e.target.value }))}
              />
              <Button size="sm" onClick={() => handleSave(c._id)} loading={savePricingMut.isPending}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Reseller Order History</h2>
        </CardHeader>
        <CardBody>
          {!reseller.orders?.length ? (
            <p className="text-sm text-slate-500">No orders yet.</p>
          ) : (
            <DataTable className="border-0 shadow-none">
              <DataTableHead>
                <DataTableHeaderCell>Date</DataTableHeaderCell>
                <DataTableHeaderCell>Subscription</DataTableHeaderCell>
                <DataTableHeaderCell>Client Email</DataTableHeaderCell>
                <DataTableHeaderCell>Status</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">Sale</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">Profit</DataTableHeaderCell>
              </DataTableHead>
              <DataTableBody>
                {reseller.orders.map((o) => (
                  <DataTableRow key={o._id}>
                    <DataTableCell>{formatDate(o.purchaseDate)}</DataTableCell>
                    <DataTableCell>{o.categoryId?.name || '—'}</DataTableCell>
                    <DataTableCell>{o.clientEmail || '—'}</DataTableCell>
                    <DataTableCell>
                      <Badge className={paymentColor(o.paymentStatus)}>{o.paymentStatus}</Badge>
                    </DataTableCell>
                    <DataTableCell numeric>{currency(o.sellingPrice || 0)}</DataTableCell>
                    <DataTableCell numeric className="font-semibold text-emerald-700">{currency((o.sellingPrice || 0) - (o.purchasePrice || 0))}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
