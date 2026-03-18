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
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-4 sm:text-2xl">Reminders</h1>

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
