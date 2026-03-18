import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
    )}
    <select
      ref={ref}
      className={clsx(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
        error ? 'border-danger-500' : 'border-slate-300',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;
