import { clsx } from 'clsx';

export default function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('border-b border-slate-100 px-4 py-3 sm:px-6', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={clsx('px-4 py-4 sm:px-6', className)}>{children}</div>;
}
