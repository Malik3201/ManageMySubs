import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import SubscriptionDataTable from '../components/subscription/SubscriptionDataTable';
import { useSubscriptions, useToggleArchiveSubscription } from '../hooks/useSubscriptions';

export default function Renewals() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const params = useMemo(
    () => ({
      page,
      limit: 25,
      sort: 'endingSoon',
      expiringIn: '14',
    }),
    [page]
  );
  const { data, isLoading, isError, refetch } = useSubscriptions(params);
  const archiveMut = useToggleArchiveSubscription();

  const subs = data?.data || [];
  const pagination = data?.pagination;

  const onArchive = (id) => {
    if (!window.confirm('Archive this subscription?')) return;
    archiveMut.mutate(id);
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return <ErrorState title="Renewals unavailable" description="We couldn't load renewals." onRetry={refetch} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Pipeline"
        title="Renewals"
        description="Subscriptions ending within the next 14 days — sorted by nearest end date first."
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => navigate('/reminders')}>
              Reminders
            </Button>
            <Button size="sm" onClick={() => navigate('/subscriptions/new')}>
              New subscription
            </Button>
          </>
        }
      />

      {!subs.length ? (
        <EmptyState
          icon={RefreshCw}
          title="Nothing renewing soon"
          description="When subscriptions approach their end date in the next two weeks, they will appear here."
        >
          <Button variant="secondary" onClick={() => navigate('/subscriptions')}>
            View all subscriptions
          </Button>
        </EmptyState>
      ) : (
        <>
          <SubscriptionDataTable
            rows={subs}
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
