import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useSubscriptions } from '../hooks/useSubscriptions';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '../components/ui/DataTable';
import { formatDate } from '../utils/dateHelpers';
import { currency } from '../utils/formatters';

function aggregateCustomers(subs) {
  const map = new Map();
  for (const s of subs) {
    const key = `${s.clientName || ''}|${s.clientPhone || ''}|${s.clientEmail || ''}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        clientName: s.clientName,
        clientPhone: s.clientPhone,
        clientEmail: s.clientEmail,
        count: 0,
        totalSales: 0,
        latestEnd: null,
        sampleId: s._id,
      });
    }
    const row = map.get(key);
    row.count += 1;
    row.totalSales += Number(s.sellingPrice) || 0;
    const end = s.currentEndDate ? new Date(s.currentEndDate) : null;
    if (end && !Number.isNaN(end.getTime())) {
      if (!row.latestEnd || end > row.latestEnd) row.latestEnd = end;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
}

export default function Customers() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSubscriptions({ page: 1, limit: 100, sort: 'latest' });
  const subs = data?.data || [];

  const rows = useMemo(() => aggregateCustomers(subs), [subs]);

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return (
      <ErrorState title="Customers unavailable" description="We couldn't load subscription data." onRetry={refetch} />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Unique clients inferred from your subscription entries (based on name, phone, and email)."
        actions={
          <Button size="sm" onClick={() => navigate('/subscriptions/new')}>
            New subscription
          </Button>
        }
      />

      {!rows.length ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Create subscriptions to see clients aggregated here."
        >
          <Button onClick={() => navigate('/subscriptions/new')}>Add subscription</Button>
        </EmptyState>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            Showing up to {subs.length} recent subscriptions — customer list is derived from this sample.
          </p>
          <DataTable>
            <DataTableHead>
              <DataTableHeaderCell>Customer</DataTableHeaderCell>
              <DataTableHeaderCell>Contact</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Subs</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Lifetime sales</DataTableHeaderCell>
              <DataTableHeaderCell>Next end date</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Open</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {rows.map((r) => (
                <DataTableRow key={r.key} onClick={() => navigate(`/subscriptions/${r.sampleId}`)}>
                  <DataTableCell className="font-semibold text-slate-900">{r.clientName || '—'}</DataTableCell>
                  <DataTableCell>
                    <div className="text-sm text-slate-600">{r.clientPhone || '—'}</div>
                    <div className="text-xs text-slate-400">{r.clientEmail || ''}</div>
                  </DataTableCell>
                  <DataTableCell numeric>{r.count}</DataTableCell>
                  <DataTableCell numeric className="font-semibold text-primary-700">
                    {currency(r.totalSales)}
                  </DataTableCell>
                  <DataTableCell>{r.latestEnd ? formatDate(r.latestEnd) : '—'}</DataTableCell>
                  <DataTableCell numeric>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/subscriptions/${r.sampleId}`);
                      }}
                    >
                      Profile
                    </Button>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </>
      )}
    </div>
  );
}
