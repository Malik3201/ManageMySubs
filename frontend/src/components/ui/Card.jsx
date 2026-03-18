import { clsx } from 'clsx';

export default function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-white/70 bg-white/92 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-sm',
        onClick && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-24px_rgba(79,70,229,0.28)]',
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
    <div className={clsx('border-b border-slate-100/90 px-4 py-4 sm:px-6', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={clsx('px-4 py-4 sm:px-6', className)}>{children}</div>;
}
