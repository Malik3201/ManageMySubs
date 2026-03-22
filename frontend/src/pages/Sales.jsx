import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import SubscriptionDataTable from '../components/subscription/SubscriptionDataTable';
import { useSubscriptions, useToggleArchiveSubscription } from '../hooks/useSubscriptions';

export default function Sales() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 25, sort: 'latest' }), [page]);
  const { data, isLoading, isError, refetch } = useSubscriptions(params);
  const archiveMut = useToggleArchiveSubscription();

  const subs = data?.data || [];
  const pagination = data?.pagination;

  const onArchive = (id) => {
    if (!window.confirm('Archive this subscription? It can be restored from filters later.')) return;
    archiveMut.mutate(id);
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return <ErrorState title="Sales unavailable" description="We couldn't load sales." onRetry={refetch} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Revenue"
        title="Sales"
        description="Every subscription sale with profit, payment state, and quick actions — sorted by newest."
        actions={
          <Button size="sm" onClick={() => navigate('/subscriptions/new')}>
            New sale
          </Button>
        }
      />

      {!subs.length ? (
        <EmptyState
          icon={TrendingUp}
          title="No sales yet"
          description="Record a subscription to populate this ledger-style view."
        >
          <Button onClick={() => navigate('/subscriptions/new')}>Create subscription</Button>
        </EmptyState>
      ) : (
        <>
          <SubscriptionDataTable
            rows={subs}
            showPurchaseDate
            onArchive={onArchive}
            archivingId={archiveMut.isPending ? archiveMut.variables : undefined}
          />
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
