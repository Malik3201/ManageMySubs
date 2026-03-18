import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useReminders, useCompleteReminder, useDismissReminder } from '../hooks/useReminders';
import ReminderCard from '../components/reminder/ReminderCard';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PERIOD_TABS = [
  { key: undefined, label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
];

const TYPE_TABS = [
  { key: undefined, label: 'All Types' },
  { key: 'expiring_soon', label: 'Expiring' },
  { key: 'expired', label: 'Expired' },
  { key: 'renewal_due', label: 'Renewal' },
  { key: 'payment_pending', label: 'Payment' },
  { key: 'replacement_completed', label: 'Replacement' },
  { key: 'followup', label: 'Follow Up' },
];

const STATUS_TABS = [
  { key: undefined, label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'dismissed', label: 'Dismissed' },
];

export default function Reminders() {
  const [period, setPeriod] = useState(undefined);
  const [type, setType] = useState(undefined);
  const [status, setStatus] = useState('pending');

  const params = { period, type, status };
  const { data: reminders, isLoading, isError, refetch } = useReminders(params);
  const completeMut = useCompleteReminder();
  const dismissMut = useDismissReminder();

  const TabBar = ({ items, value, onChange }) => (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {items.map((item) => (
        <button
          key={item.key ?? 'all'}
          onClick={() => onChange(item.key)}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            value === item.key
              ? 'bg-primary-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-white to-cyan-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Reminder Center</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Follow-ups that feel organized, not overwhelming.</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track renewals, payment follow-up, expiry windows, and replacement completion with soft visual priority.
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <TabBar items={PERIOD_TABS} value={period} onChange={setPeriod} />
        <TabBar items={TYPE_TABS} value={type} onChange={setType} />
        <TabBar items={STATUS_TABS} value={status} onChange={setStatus} />
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : isError ? (
        <ErrorState
          title="Reminders unavailable"
          description="We couldn't load your reminders."
          onRetry={refetch}
        />
      ) : !reminders?.length ? (
        <EmptyState icon={Bell} title="No reminders" description="You're all caught up! Reminders will appear here as they are generated." />
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <ReminderCard
              key={r._id}
              reminder={r}
              onComplete={(id) => completeMut.mutate(id)}
              onDismiss={(id) => dismissMut.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
