import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-[0_10px_24px_-12px_rgba(79,70,229,0.9)] hover:-translate-y-0.5 hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500',
  secondary: 'border border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:ring-primary-500',
  danger: 'bg-gradient-to-r from-danger-600 to-danger-700 text-white shadow-[0_10px_24px_-12px_rgba(220,38,38,0.75)] hover:-translate-y-0.5 hover:from-danger-700 hover:to-danger-800 focus:ring-danger-500',
  ghost: 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 focus:ring-primary-500',
  success: 'bg-gradient-to-r from-success-600 to-success-700 text-white shadow-[0_10px_24px_-12px_rgba(5,150,105,0.8)] hover:-translate-y-0.5 hover:from-success-700 hover:to-success-700 focus:ring-success-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
