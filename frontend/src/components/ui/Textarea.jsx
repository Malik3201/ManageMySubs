import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
    )}
    <textarea
      ref={ref}
      rows={3}
      className={clsx(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
        error ? 'border-danger-500' : 'border-slate-300',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';
export default Textarea;
