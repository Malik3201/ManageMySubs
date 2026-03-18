import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <Loader2 className={clsx('animate-spin text-primary-500', sizes[size])} />
    </div>
  );
}
