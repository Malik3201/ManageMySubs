import { useQuery } from '@tanstack/react-query';
import { fetchTimeline } from '../../api/timeline';
import { formatDate, formatRelative } from '../../utils/dateHelpers';
import { capitalize } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import {
  PlusCircle,
  RefreshCw,
  ArrowRightLeft,
  CreditCard,
  XCircle,
  Archive,
  RotateCcw,
  Edit,
  Bell,
  Clock,
} from 'lucide-react';

const icons = {
  created: PlusCircle,
  renewed: RefreshCw,
  replacement_issued: ArrowRightLeft,
  payment_updated: CreditCard,
  expired: Clock,
  cancelled: XCircle,
  archived: Archive,
  restored: RotateCcw,
  updated: Edit,
  reminder_completed: Bell,
};

export default function Timeline({ subscriptionId }) {
  const { data: logs, isLoading, isError, refetch } = useQuery({
    queryKey: ['timeline', subscriptionId],
    queryFn: () => fetchTimeline(subscriptionId),
    enabled: !!subscriptionId,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <ErrorState
        title="Timeline unavailable"
        description="We couldn't load the activity history for this subscription."
        onRetry={refetch}
      />
    );
  }
  if (!logs?.length) return <p className="text-sm text-slate-500 py-4">No activity yet.</p>;

  return (
    <div className="relative space-y-4 pl-6">
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200" />
      {logs.map((log) => {
        const Icon = icons[log.actionType] || Clock;
        return (
          <div key={log._id} className="relative flex gap-3">
            <div className="absolute -left-3.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200">
              <Icon className="h-3 w-3 text-primary-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">
                {capitalize(log.actionType)}
              </p>
              <p className="text-xs text-slate-500">
                {formatDate(log.createdAt)} &middot; {formatRelative(log.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
