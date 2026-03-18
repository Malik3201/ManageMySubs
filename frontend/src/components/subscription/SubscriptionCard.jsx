import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Mail, Phone, User } from 'lucide-react';
import Card from '../ui/Card';
import StatusBadge from './StatusBadge';
import PaymentBadge from './PaymentBadge';
import { formatDate } from '../../utils/dateHelpers';
import { currency } from '../../utils/formatters';

const cardPalettes = [
  {
    surface: 'from-white to-primary-50/90 border-primary-100/80',
    pill: 'bg-primary-50 text-primary-700',
    accent: 'text-primary-600',
  },
  {
    surface: 'from-white to-emerald-50/90 border-emerald-100/80',
    pill: 'bg-emerald-50 text-emerald-700',
    accent: 'text-emerald-600',
  },
  {
    surface: 'from-white to-amber-50/90 border-amber-100/80',
    pill: 'bg-amber-50 text-amber-700',
    accent: 'text-amber-600',
  },
  {
    surface: 'from-white to-rose-50/90 border-rose-100/80',
    pill: 'bg-rose-50 text-rose-700',
    accent: 'text-rose-600',
  },
];

export default function SubscriptionCard({ subscription }) {
  const navigate = useNavigate();
  const s = subscription;
  const catName = s.categoryId?.name || 'Unknown';
  const paletteSeed = `${catName}-${s.clientName || ''}`;
  const palette =
    cardPalettes[
      Array.from(paletteSeed).reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        cardPalettes.length
    ];

  return (
    <Card
      onClick={() => navigate(`/subscriptions/${s._id}`)}
      className={`overflow-hidden border p-4 bg-gradient-to-br ${palette.surface} hover:border-primary-200`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${palette.pill}`}>
              {catName}
            </span>
            <StatusBadge status={s.computedStatus || s.status} />
          </div>
          <h3 className="truncate text-base font-semibold text-slate-900">
            {s.clientName || 'Unnamed Client'}
          </h3>
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            {s.clientPhone && (
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {s.clientPhone}
              </p>
            )}
            {s.clientEmail && (
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5" /> {s.clientEmail}
              </p>
            )}
            {!s.clientPhone && !s.clientEmail && (
              <p className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> No contact details saved
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold tracking-tight text-slate-900">{currency(s.sellingPrice)}</p>
          <PaymentBadge status={s.paymentStatus} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:grid-cols-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Started {formatDate(s.startDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {s.remainingDays ?? 0} days left
        </span>
        {s.tags?.length > 0 && (
          <span className={`truncate font-medium ${palette.accent}`}>{s.tags.join(', ')}</span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">Ends {formatDate(s.currentEndDate)}</span>
        <span className={`text-xs font-semibold ${palette.accent}`}>Open details</span>
      </div>
    </Card>
  );
}
