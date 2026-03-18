import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard, SlidersHorizontal, X } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useCategories } from '../hooks/useCategories';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
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
  { label: 'Pending Payment', key: 'paymentStatus', value: 'pending' },
  { label: 'Paid', key: 'paymentStatus', value: 'paid' },
  { label: 'Partial', key: 'paymentStatus', value: 'partially_paid' },
];

export default function Subscriptions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const params = useMemo(() => ({
    search: search || undefined,
    page,
    limit: 20,
    ...filters,
  }), [search, page, filters]);

  const { data, isLoading, isError, refetch } = useSubscriptions(params);
  const { data: categories } = useCategories();
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

  const clearFilters = () => { setFilters({}); setSearch(''); setPage(1); };
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

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-white to-primary-50 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Subscription Sales</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Manage every client cycle with speed.</h1>
            <p className="mt-1 text-sm text-slate-500">
              Search by client name, email, or phone and jump into renewal or payment follow-up quickly.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/subscriptions/new')}>
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search client name, email, or phone..." />
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
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Advanced filters</span>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              {SUBSCRIPTION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => updateFilter('paymentStatus', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filters.expiringIn || ''}
              onChange={(e) => updateFilter('expiringIn', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Expiry Window</option>
              <option value="3">Expiring in 3 days</option>
              <option value="7">Expiring in 7 days</option>
            </select>
            <select
              value={filters.archived || ''}
              onChange={(e) => updateFilter('archived', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Active Only</option>
              <option value="true">Archived</option>
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : isError ? (
        <ErrorState
          title="Subscriptions unavailable"
          description="We couldn't load the subscription list."
          onRetry={refetch}
        />
      ) : !subs.length ? (
        <EmptyState icon={CreditCard} title="No subscriptions found" description="Create your first subscription or adjust your filters.">
          <Button onClick={() => navigate('/subscriptions/new')}>
            <Plus className="h-4 w-4" /> Create Subscription
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-medium text-slate-700">{pagination?.total ?? subs.length} subscriptions</p>
            <p className="text-xs text-slate-400">Tap any card for renewals, replacement, payment, and history.</p>
          </div>

          <div className="space-y-3">
            {subs.map((s) => (
              <SubscriptionCard key={s._id} subscription={s} />
            ))}
          </div>

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
