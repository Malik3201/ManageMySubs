import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, SlidersHorizontal, X, LayoutGrid, Table2, CreditCard } from 'lucide-react';
import { useSubscriptions, useToggleArchiveSubscription } from '../hooks/useSubscriptions';
import { useCategories } from '../hooks/useCategories';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import SubscriptionDataTable from '../components/subscription/SubscriptionDataTable';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SUBSCRIPTION_STATUSES, PAYMENT_STATUSES } from '../utils/constants';

const quickFilters = [
  { label: 'Active', key: 'status', value: 'active' },
  { label: 'Expired', key: 'status', value: 'expired' },
  { label: 'Expiring 3d', key: 'expiringIn', value: '3' },
  { label: 'Expiring 7d', key: 'expiringIn', value: '7' },
  { label: 'Replacement', key: 'status', value: 'in_replacement' },
  { label: 'Pending pay', key: 'paymentStatus', value: 'pending' },
  { label: 'Paid', key: 'paymentStatus', value: 'paid' },
  { label: 'Partial', key: 'paymentStatus', value: 'partially_paid' },
];

export default function Subscriptions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('table');

  const params = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit: 20,
      ...filters,
    }),
    [search, page, filters]
  );

  const { data, isLoading, isError, refetch } = useSubscriptions(params);
  const { data: categories } = useCategories();
  const archiveMut = useToggleArchiveSubscription();

  const subs = data?.data || [];
  const pagination = data?.pagination;

  const updateFilter = (key, value) => {
    setFilters((f) => {
      const next = { ...f };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setPage(1);
  };
  const activeFilterCount = Object.keys(filters).length;

  const applyQuickFilter = (key, value) => {
    setFilters((current) => {
      const next = { ...current };
      if (key === 'status') delete next.expiringIn;
      if (key === 'expiringIn') delete next.status;
      if (next[key] === value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setPage(1);
  };

  const onArchive = (id) => {
    if (!window.confirm('Archive this subscription?')) return;
    archiveMut.mutate(id);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations"
        title="Subscriptions"
        description="Search, filter, and manage every client subscription in a compact SaaS layout."
        actions={
          <>
            <div className="hidden items-center rounded-2xl border border-slate-200/80 bg-white/80 p-1 sm:flex">
              <button
                type="button"
                onClick={() => setView('table')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  view === 'table' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" /> Table
              </button>
              <button
                type="button"
                onClick={() => setView('cards')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  view === 'cards' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Cards
              </button>
            </div>
            <Button size="sm" onClick={() => navigate('/subscriptions/new')}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </>
        }
      />

      <div className="rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-md sm:p-5">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search name, email, or phone…"
            />
          </div>
          <Button
            size="sm"
            variant={activeFilterCount ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickFilters.map((filter) => {
            const active = filters[filter.key] === filter.value;
            return (
              <button
                key={`${filter.key}-${filter.value}`}
                type="button"
                onClick={() => applyQuickFilter(filter.key, filter.value)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                    : 'bg-secondary-50 text-secondary-700 ring-1 ring-secondary-200/80 hover:bg-secondary-100/80'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-secondary-50/50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Advanced filters</span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            >
              <option value="">All statuses</option>
              {SUBSCRIPTION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => updateFilter('paymentStatus', e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            >
              <option value="">All payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            >
              <option value="">All categories</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={filters.expiringIn || ''}
              onChange={(e) => updateFilter('expiringIn', e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            >
              <option value="">Expiry window</option>
              <option value="3">Expiring in 3 days</option>
              <option value="7">Expiring in 7 days</option>
            </select>
            <select
              value={filters.archived || ''}
              onChange={(e) => updateFilter('archived', e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            >
              <option value="">Active only</option>
              <option value="true">Archived</option>
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : isError ? (
        <ErrorState title="Subscriptions unavailable" description="We couldn't load the list." onRetry={refetch} />
      ) : !subs.length ? (
        <EmptyState
          icon={CreditCard}
          title="No subscriptions found"
          description="Create your first subscription or adjust filters."
        >
          <Button onClick={() => navigate('/subscriptions/new')}>
            <Plus className="h-4 w-4" /> Create subscription
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-800">
              {pagination?.total ?? subs.length} subscriptions
            </p>
            <p className="text-xs text-slate-500">Row click opens details · Edit and archive from the actions column.</p>
          </div>

          {view === 'table' ? (
            <SubscriptionDataTable
              rows={subs}
              onArchive={onArchive}
              archivingId={archiveMut.isPending ? archiveMut.variables : undefined}
            />
          ) : (
            <div className="space-y-3">
              {subs.map((s) => (
                <SubscriptionCard key={s._id} subscription={s} />
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Prev
              </Button>
              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button size="sm" variant="secondary" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
