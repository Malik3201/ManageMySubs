import {
  Activity,
  AlertTriangle,
  XCircle,
  Bell,
  DollarSign,
  TrendingUp,
  ArrowRightLeft,
  CheckCircle,
  RefreshCw,
  Clock,
  Wallet,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import StatCard from '../components/dashboard/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { currency } from '../utils/formatters';

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description="We couldn't load your dashboard right now."
        onRetry={refetch}
      />
    );
  }

  const stats = [
    { label: 'Active Subscriptions', value: data?.activeCount ?? 0, icon: Activity, color: 'text-success-600', bgColor: 'bg-success-50', surfaceClass: 'from-white to-emerald-50/90 border-emerald-100/80' },
    { label: 'Expiring Soon', value: data?.expiringSoonCount ?? 0, icon: AlertTriangle, color: 'text-warning-600', bgColor: 'bg-warning-50', surfaceClass: 'from-white to-amber-50/90 border-amber-100/80' },
    { label: 'Expired', value: data?.expiredCount ?? 0, icon: XCircle, color: 'text-danger-600', bgColor: 'bg-danger-50', surfaceClass: 'from-white to-rose-50/90 border-rose-100/80' },
    { label: 'Reminders Due', value: data?.remindersDue ?? 0, icon: Bell, color: 'text-primary-600', bgColor: 'bg-primary-50', surfaceClass: 'from-white to-blue-50/90 border-blue-100/80' },
    { label: 'Today Sales', value: currency(data?.todaySales ?? 0), icon: DollarSign, color: 'text-success-600', bgColor: 'bg-success-50', surfaceClass: 'from-white to-lime-50/90 border-lime-100/80' },
    { label: 'Today Profit', value: currency(data?.todayProfit ?? 0), icon: TrendingUp, color: 'text-success-600', bgColor: 'bg-success-50', surfaceClass: 'from-white to-teal-50/90 border-teal-100/80' },
    { label: 'Monthly Sales', value: currency(data?.monthlySales ?? 0), icon: Wallet, color: 'text-primary-600', bgColor: 'bg-primary-50', surfaceClass: 'from-white to-indigo-50/90 border-indigo-100/80' },
    { label: 'Monthly Profit', value: currency(data?.monthlyProfit ?? 0), icon: TrendingUp, color: 'text-primary-600', bgColor: 'bg-primary-50', surfaceClass: 'from-white to-violet-50/90 border-violet-100/80' },
    { label: 'Active Replacements', value: data?.replacementsActive ?? 0, icon: ArrowRightLeft, color: 'text-warning-600', bgColor: 'bg-warning-50', surfaceClass: 'from-white to-orange-50/90 border-orange-100/80' },
    { label: 'Payment Pending', value: data?.paymentPending ?? 0, icon: Clock, color: 'text-danger-600', bgColor: 'bg-danger-50', surfaceClass: 'from-white to-pink-50/90 border-pink-100/80' },
    { label: 'Paid Subscriptions', value: data?.paidCount ?? 0, icon: CheckCircle, color: 'text-success-600', bgColor: 'bg-success-50', surfaceClass: 'from-white to-green-50/90 border-green-100/80' },
    { label: 'Renewals This Month', value: data?.renewalsThisMonth ?? 0, icon: RefreshCw, color: 'text-primary-600', bgColor: 'bg-primary-50', surfaceClass: 'from-white to-cyan-50/90 border-cyan-100/80' },
  ];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-primary-900 to-primary-700 p-6 text-white shadow-[0_30px_80px_-35px_rgba(67,56,202,0.7)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-200">Seller Overview</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Keep renewals, payments, and profits in one calm workflow.
            </h1>
            <p className="mt-3 text-sm text-primary-100/85 sm:text-base">
              Today you have {data?.remindersDue ?? 0} reminders due, {data?.expiringSoonCount ?? 0} subscriptions expiring soon, and {currency(data?.todayProfit ?? 0)} profit tracked so far.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-primary-100/70">Today Sales</p>
              <p className="mt-2 text-2xl font-bold">{currency(data?.todaySales ?? 0)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-primary-100/70">Monthly Profit</p>
              <p className="mt-2 text-2xl font-bold">{currency(data?.monthlyProfit ?? 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Performance snapshot</h2>
            <p className="text-sm text-slate-500">Live counts for renewals, payments, reminders, and replacement activity.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>
    </div>
  );
}
