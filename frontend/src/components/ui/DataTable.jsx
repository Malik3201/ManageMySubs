import { cn } from '../../utils/cn';

export function DataTable({ children, className }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function DataTableHead({ children }) {
  return (
    <thead>
      <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-secondary-50/40 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableHeaderCell({ children, className }) {
  return <th className={cn('px-4 py-3 font-semibold', className)}>{children}</th>;
}

export function DataTableBody({ children }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function DataTableRow({ children, onClick, className }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors hover:bg-secondary-50/50',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({ children, className, numeric }) {
  return (
    <td className={cn('px-4 py-3 text-slate-700', numeric && 'text-right tabular-nums', className)}>{children}</td>
  );
}
