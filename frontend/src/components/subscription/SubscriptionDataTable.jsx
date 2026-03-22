import { Eye, Pencil, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PaymentBadge from './PaymentBadge';
import Button from '../ui/Button';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '../ui/DataTable';
import { formatDate } from '../../utils/dateHelpers';
import { currency } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const tagColors = ['bg-primary-100 text-primary-800', 'bg-accent-100 text-accent-800', 'bg-secondary-100 text-secondary-800', 'bg-emerald-100 text-emerald-800'];

export default function SubscriptionDataTable({
  rows = [],
  showPurchaseDate = false,
  onArchive,
  archivingId,
}) {
  const navigate = useNavigate();

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>Client</DataTableHeaderCell>
        <DataTableHeaderCell>Category</DataTableHeaderCell>
        {showPurchaseDate && <DataTableHeaderCell>Purchase</DataTableHeaderCell>}
        <DataTableHeaderCell>Status</DataTableHeaderCell>
        <DataTableHeaderCell>Payment</DataTableHeaderCell>
        <DataTableHeaderCell className="text-right">Sale</DataTableHeaderCell>
        <DataTableHeaderCell className="text-right">Profit</DataTableHeaderCell>
        <DataTableHeaderCell>Ends</DataTableHeaderCell>
        <DataTableHeaderCell className="text-right">Actions</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {rows.map((s) => {
          const profit = s.profit ?? ((s.sellingPrice || 0) - (s.purchasePrice || 0));
          const tags = s.tags || [];
          return (
            <DataTableRow key={s._id} onClick={() => navigate(`/subscriptions/${s._id}`)}>
              <DataTableCell>
                <div className="font-medium text-slate-900">{s.clientName || '—'}</div>
                <div className="text-xs text-slate-500">{s.clientPhone || s.clientEmail || ''}</div>
                {tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={tag}
                        className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', tagColors[i % tagColors.length])}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </DataTableCell>
              <DataTableCell>
                <span className="rounded-lg bg-secondary-50 px-2 py-1 text-xs font-semibold text-secondary-800">
                  {s.categoryId?.name || '—'}
                </span>
              </DataTableCell>
              {showPurchaseDate && (
                <DataTableCell className="whitespace-nowrap text-slate-600">{formatDate(s.purchaseDate)}</DataTableCell>
              )}
              <DataTableCell>
                <StatusBadge status={s.computedStatus || s.status} />
              </DataTableCell>
              <DataTableCell>
                <PaymentBadge status={s.paymentStatus} />
              </DataTableCell>
              <DataTableCell numeric className="font-semibold text-slate-900">
                {currency(s.sellingPrice)}
              </DataTableCell>
              <DataTableCell numeric className="font-medium text-success-700">
                {currency(profit)}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap text-slate-600">{formatDate(s.currentEndDate)}</DataTableCell>
              <DataTableCell numeric>
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="!px-2"
                    aria-label="View"
                    onClick={() => navigate(`/subscriptions/${s._id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="!px-2"
                    aria-label="Edit"
                    onClick={() => navigate(`/subscriptions/${s._id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {onArchive && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="!px-2 text-slate-500 hover:text-danger-600"
                      loading={archivingId === s._id}
                      aria-label="Archive"
                      onClick={() => onArchive(s._id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTableBody>
    </DataTable>
  );
}
