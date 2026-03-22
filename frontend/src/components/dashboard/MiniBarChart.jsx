import { format, parseISO } from 'date-fns';
import { cn } from '../../utils/cn';

/**
 * Lightweight 7-day sales bars (uses daily report rows). No chart library.
 */
export default function MiniBarChart({ rows = [], valueKey = 'sales', className }) {
  const sorted = [...rows].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const last7 = sorted.slice(-7);
  const maxVal = Math.max(1, ...last7.map((r) => Number(r[valueKey]) || 0));

  if (!last7.length) {
    return (
      <div className={cn('flex h-28 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 text-xs text-slate-400', className)}>
        No sales in this range yet
      </div>
    );
  }

  return (
    <div className={cn('flex h-28 items-end gap-1.5', className)}>
      {last7.map((row) => {
        const v = Number(row[valueKey]) || 0;
        const h = Math.round((v / maxVal) * 100);
        const label = row.date
          ? (() => {
              try {
                return format(parseISO(row.date), 'EEE');
              } catch {
                return row.date?.slice(5) || '';
              }
            })()
          : '';
        return (
          <div key={row.date || `bar-${label}`} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center">
              <div
                className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-primary-600 to-accent-400 shadow-sm"
                style={{ height: `${Math.max(8, h)}%` }}
                title={`${label}: ${v}`}
              />
            </div>
            <span className="truncate text-[10px] font-medium text-slate-400">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
