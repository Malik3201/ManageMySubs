import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-danger-100 bg-danger-50/60 px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-white p-3 shadow-sm">
        <AlertTriangle className="h-6 w-6 text-danger-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {onRetry && (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
