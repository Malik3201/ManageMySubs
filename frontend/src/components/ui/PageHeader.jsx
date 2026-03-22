import { cn } from '../../utils/cn';

export default function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-[28px] border border-white/80 bg-gradient-to-br from-white via-white to-secondary-50/60 p-5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-600">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
