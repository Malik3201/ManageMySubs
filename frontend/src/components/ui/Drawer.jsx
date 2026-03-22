import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * App-style slide-over panel. Use for forms instead of plain full pages.
 */
export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  widthClassName = 'max-w-xl',
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        className={cn(
          'relative flex h-full w-full flex-col border-l border-white/60 bg-white/95 shadow-2xl shadow-primary-900/10 backdrop-blur-xl',
          widthClassName,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="shrink-0 border-t border-slate-100 px-5 py-4">{footer}</footer>}
      </aside>
    </div>
  );
}
