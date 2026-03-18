import { useState } from 'react';
import { Bell, Check, Copy, X } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate } from '../../utils/dateHelpers';
import { capitalize } from '../../utils/formatters';

const typeColors = {
  expiring_soon: 'bg-warning-50 text-warning-600',
  expired: 'bg-danger-50 text-danger-600',
  renewal_due: 'bg-primary-50 text-primary-600',
  replacement_completed: 'bg-slate-100 text-slate-600',
  payment_pending: 'bg-danger-50 text-danger-600',
  followup: 'bg-primary-50 text-primary-600',
};

export default function ReminderCard({ reminder, onComplete, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const sub = reminder.clientSubscriptionId;
  const catName = sub?.categoryId?.name || 'Subscription';

  const handleCopy = async () => {
    if (!reminder.messageTemplate) return;
    await navigator.clipboard.writeText(reminder.messageTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary-50 p-2">
          <Bell className="h-4 w-4 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className={typeColors[reminder.type] || 'bg-slate-100 text-slate-600'}>
              {capitalize(reminder.type)}
            </Badge>
            <span className="text-xs text-slate-400">{formatDate(reminder.dueDate)}</span>
          </div>
          <p className="text-sm font-medium text-slate-800">
            {sub?.clientName || 'Client'} — {catName}
          </p>
          {reminder.messageTemplate && (
            <div className="mt-1">
              <p className="text-xs text-slate-500 line-clamp-2">{reminder.messageTemplate}</p>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-2 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700"
              >
                {copied ? <Check className="h-3 w-3 text-success-600" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy message'}
              </button>
            </div>
          )}
          {reminder.status === 'pending' && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="success" onClick={() => onComplete(reminder._id)}>
                <Check className="h-3.5 w-3.5" /> Done
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDismiss(reminder._id)}>
                <X className="h-3.5 w-3.5" /> Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
