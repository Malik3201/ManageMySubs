import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { cn } from '../../utils/cn';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white text-emerald-900 shadow-[0_12px_40px_-20px_rgba(16,185,129,0.45)]',
  error: 'border-rose-200/80 bg-gradient-to-r from-rose-50 to-white text-rose-900 shadow-[0_12px_40px_-20px_rgba(244,63,94,0.35)]',
  info: 'border-primary-200/80 bg-gradient-to-r from-primary-50 to-white text-primary-900 shadow-[0_12px_40px_-20px_rgba(79,70,229,0.25)]',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-20 right-4 z-[100] flex max-w-sm flex-col gap-2 md:bottom-6 md:right-6"
      role="region"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-sm',
              styles[t.type] || styles.info
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-90" />
            <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-black/5 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
